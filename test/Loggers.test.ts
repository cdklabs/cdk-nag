/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { readFileSync, rmSync } from 'fs';
import { join } from 'path';
import {
  App,
  Aspects,
  CfnResource,
  NestedStack,
  Stack,
  Stage,
  Token,
} from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Bucket, CfnBucket } from 'aws-cdk-lib/aws-s3';
import { IConstruct } from 'constructs';
import {
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagRuleCompliance,
} from '../src';
import {
  NagReportLogger,
  NagReportLine,
  NagReportSchema,
  NagReportFormat,
  INagLogger,
  NagLoggerComplianceData,
  NagLoggerErrorData,
  NagLoggerNonComplianceData,
  NagLoggerNotApplicableData,
  NagLoggerBaseData,
  AnnotationLogger,
} from '../src/nag-logger';

describe('NagReportLogger', () => {
  class ReportPack extends NagPack {
    constructor(props?: NagPackProps) {
      super(props);
      this.packName = 'Test';
    }
    public visit(node: IConstruct): void {
      if (node instanceof CfnResource) {
        const compliances = [
          NagRuleCompliance.NON_COMPLIANT,
          NagRuleCompliance.COMPLIANT,
          NagRuleCompliance.NOT_APPLICABLE,
        ];
        compliances.forEach((compliance) => {
          const ReportPackRule = function (
            node2: CfnResource
          ): NagRuleCompliance {
            if (node2.cfnResourceType === 'N/A') {
              return NagRuleCompliance.NOT_APPLICABLE;
            } else if (node2.cfnResourceType !== 'Error') {
              return compliance;
            }
            throw Error('foobar');
          };
          this.applyRule({
            ruleSuffixOverride: compliance,
            info: 'foo.',
            explanation: 'bar.',
            level: NagMessageLevel.ERROR,
            rule: ReportPackRule,
            node: node,
          });
        });
      }
    }
  }

  class MemoryLogger implements INagLogger {
    public results: NagLoggerBaseData[] = [];

    onCompliance(data: NagLoggerComplianceData): void {
      this.results.push(data);
    }
    onNonCompliance(data: NagLoggerNonComplianceData): void {
      this.results.push(data);
    }
    onError(data: NagLoggerErrorData): void {
      this.results.push(data);
    }
    onNotApplicable(data: NagLoggerNotApplicableData): void {
      this.results.push(data);
    }
  }

  let app: App;
  let pack: NagPack;
  let reportLogger: NagReportLogger;
  let memoryLogger: MemoryLogger;

  beforeEach(() => {
    app = new App();
    reportLogger = new NagReportLogger({
      formats: [NagReportFormat.CSV, NagReportFormat.JSON],
    });
    memoryLogger = new MemoryLogger();
    pack = new ReportPack({
      reports: false,
      additionalLoggers: [reportLogger, memoryLogger],
    });
    Aspects.of(app).add(pack);
  });
  afterEach(() => {
    rmSync(app.outdir, { recursive: true });
  });

  describe('Common', () => {
    test('Reports are generated for all stacks by default', () => {
      const stack = new Stack(app, 'Stack1');
      const stack2 = new Stack(app, 'Stack2');
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
      });
      new Bucket(stack2, 'rBucket');
      app.synth();
      expect(reportLogger.getFormatStacks(NagReportFormat.CSV).length).toEqual(
        2
      );
      expect(reportLogger.getFormatStacks(NagReportFormat.JSON).length).toEqual(
        2
      );
    });
    test('Nested Stack reports do not contain tokens in names', () => {
      const parent = new Stack(app, 'Parent');
      const nested = new NestedStack(parent, 'Child', {});
      new Bucket(parent, 'rBucket');
      new Bucket(nested, 'rBucket');
      app.synth();
      reportLogger.getFormatStacks(NagReportFormat.CSV)?.forEach((r) => {
        expect(Token.isUnresolved(r)).toBeFalsy();
      });
      reportLogger.getFormatStacks(NagReportFormat.JSON)?.forEach((r) => {
        expect(Token.isUnresolved(r)).toBeFalsy();
      });
    });
    test('Original rule names are included in the logger base data', () => {
      const stack = new Stack(app, 'Stack1');
      new CfnResource(stack, 'rResource', { type: 'foo' });
      app.synth();
      memoryLogger.results.forEach((r) => {
        expect(r.ruleOriginalName).toBe('ReportPackRule');
      });
    });
    test('Reports are generated for scoped stacks', () => {
      const stage = new Stage(app, 'Stage1');
      Aspects.of(stage).add(pack);
      const stack = new Stack(stage, 'Stack1');
      new Bucket(stack, 'rBucket');

      app.synth();
      reportLogger.getFormatStacks(NagReportFormat.CSV)?.forEach((r) => {
        expect(r).toMatch('Stage1-Stack1');
      });
      reportLogger.getFormatStacks(NagReportFormat.JSON)?.forEach((r) => {
        expect(r).toMatch('Stage1-Stack1');
      });
    });
    test('Reports are generated for named stacks', () => {
      const stage = new Stage(app, 'Stage1');
      Aspects.of(stage).add(pack);

      const stack = new Stack(stage, 'Stack1', {
        stackName: 'NamedStack',
      });
      const stage2 = new Stage(app, 'Stage2');
      Aspects.of(stage2).add(pack);

      const stack2 = new Stack(stage2, 'Stack2', {
        stackName: 'NamedStack',
      });
      new Bucket(stack, 'rBucket');
      new Bucket(stack2, 'rBucket');
      app.synth();
      expect(reportLogger.getFormatStacks(NagReportFormat.CSV)).toEqual(
        expect.arrayContaining([
          expect.stringMatching('Stage1-NamedStack'),
          expect.stringMatching('Stage2-NamedStack'),
        ])
      );
      expect(reportLogger.getFormatStacks(NagReportFormat.JSON)).toEqual(
        expect.arrayContaining([
          expect.stringMatching('Stage1-NamedStack'),
          expect.stringMatching('Stage2-NamedStack'),
        ])
      );
    });
  });
  describe('CSV', () => {
    function getReportLines(reportStack: string): string[] {
      return readFileSync(join(app.outdir, reportStack))
        .toString()
        .split('\n')
        .filter(
          (l) =>
            l.length > 0 &&
            l !== 'Rule ID,Resource ID,Compliance,Rule Level,Rule Info'
        );
    }
    test('Reports are initialized for stacks with no relevant resources', () => {
      const stack = new Stack(app, 'Stack1');
      new CfnResource(stack, 'rNAResource', {
        type: 'N/A',
      });
      app.synth();
      expect(reportLogger.getFormatStacks(NagReportFormat.CSV).length).toEqual(
        1
      );
      expect(
        getReportLines(reportLogger.getFormatStacks(NagReportFormat.CSV)[0])
          .length
      ).toBe(0);
    });
    test('Compliant and Non-Compliant values are written properly', () => {
      const stack = new Stack(app, 'Stack1');
      new CfnResource(stack, 'rResource', { type: 'foo' });
      app.synth();
      const expectedOutput = [
        '"Test-Compliant","Stack1/rResource","Compliant","Error","foo."',
        '"Test-Non-Compliant","Stack1/rResource","Non-Compliant","Error","foo."',
      ];
      expect(
        getReportLines(
          reportLogger.getFormatStacks(NagReportFormat.CSV)[0]
        ).sort()
      ).toEqual(expectedOutput.sort());
    });
    test('Error values are written properly', () => {
      const stack = new Stack(app, 'Stack1');
      new CfnResource(stack, 'rResource', { type: 'Error' });
      app.synth();
      const expectedOutput = [
        '"Test-Compliant","Stack1/rResource","UNKNOWN","Error","foo."',
        '"Test-Non-Compliant","Stack1/rResource","UNKNOWN","Error","foo."',
        '"Test-N/A","Stack1/rResource","UNKNOWN","Error","foo."',
      ];
      expect(
        getReportLines(
          reportLogger.getFormatStacks(NagReportFormat.CSV)[0]
        ).sort()
      ).toEqual(expectedOutput.sort());
    });
  });
  describe('JSON', () => {
    function getReportLines(reportStack: string): NagReportLine[] {
      return (
        JSON.parse(
          readFileSync(join(app.outdir, reportStack), 'utf8')
        ) as NagReportSchema
      ).lines;
    }
    test('Reports are initialized for stacks with no relevant resources', () => {
      const stack = new Stack(app, 'Stack1');
      new CfnResource(stack, 'rNAResource', {
        type: 'N/A',
      });
      app.synth();
      expect(reportLogger.getFormatStacks(NagReportFormat.JSON).length).toEqual(
        1
      );
      expect(
        getReportLines(reportLogger.getFormatStacks(NagReportFormat.JSON)[0])
          .length
      ).toBe(0);
    });
    test('Compliant and Non-Compliant values are written properly', () => {
      const stack = new Stack(app, 'Stack1');
      new CfnResource(stack, 'rResource', { type: 'foo' });
      app.synth();
      const expectedOutput: NagReportLine[] = [
        {
          ruleId: 'Test-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Compliant',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-Non-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Non-Compliant',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
      ];
      expect(
        getReportLines(reportLogger.getFormatStacks(NagReportFormat.JSON)[0])
      ).toEqual(expect.arrayContaining(expectedOutput));
    });
    test('Error values are written properly', () => {
      const stack = new Stack(app, 'Stack1');
      new CfnResource(stack, 'rResource', { type: 'Error' });
      app.synth();
      const expectedOutput: NagReportLine[] = [
        {
          ruleId: 'Test-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'UNKNOWN',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-Non-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'UNKNOWN',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-N/A',
          resourceId: 'Stack1/rResource',
          compliance: 'UNKNOWN',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
      ];
      expect(
        getReportLines(reportLogger.getFormatStacks(NagReportFormat.JSON)[0])
      ).toEqual(expect.arrayContaining(expectedOutput));
    });
  });
});

describe('AnnotationLogger', () => {
  let app: App;
  let stack: Stack;
  let resource: Bucket;
  let cfnBucket: CfnBucket;
  let logger: AnnotationLogger;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
    resource = new Bucket(stack, 'TestBucket');
    cfnBucket = resource.node.defaultChild as CfnBucket;
    logger = new AnnotationLogger({ verbose: true });
  });

  test('should add an error annotation for ERROR level', () => {
    const data: NagLoggerNonComplianceData = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'S3BucketError1',
      ruleOriginalName: 'S3BucketError1',
      ruleInfo: 'S3 bucket rule that will throw an error',
      ruleExplanation: 'This rule throws an error for a certain condition.',
      ruleLevel: NagMessageLevel.ERROR,
      findingId: 'ERROR.1',
    };
    logger.onNonCompliance(data);
    const meta = cfnBucket.node.metadata;
    expect(
      meta.some(
        (entry) =>
          entry.type === 'aws:cdk:error' &&
          (entry.data as string).includes('S3BucketError1')
      )
    ).toBe(true);
  });

  test('should add a warning annotation for WARN level', () => {
    const data: NagLoggerNonComplianceData = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'S3BucketWarning1',
      ruleOriginalName: 'S3BucketWarning1',
      ruleInfo: 'S3 bucket rule that will throw a warning',
      ruleExplanation: 'This rule throws a warning for a certain condition.',
      ruleLevel: NagMessageLevel.WARN,
      findingId: 'WARNING.1',
    };
    logger.onNonCompliance(data);
    const meta = cfnBucket.node.metadata;
    expect(
      meta.some(
        (entry) =>
          entry.type === 'aws:cdk:warning' &&
          (entry.data as string).includes('S3BucketWarning1')
      )
    ).toBe(true);
  });
});

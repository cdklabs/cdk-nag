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
  NagSuppressions,
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
  NagLoggerSuppressedData,
  NagLoggerSuppressedErrorData,
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
    onSuppressed(data: NagLoggerSuppressedData): void {
      this.results.push(data);
    }
    onError(data: NagLoggerErrorData): void {
      this.results.push(data);
    }
    onSuppressedError(data: NagLoggerSuppressedErrorData): void {
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
      // Add reports as an additional logger for testing
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
  });
  describe('CSV', () => {
    function getReportLines(reportStack: string): string[] {
      return readFileSync(join(app.outdir, reportStack))
        .toString()
        .split('\n')
        .filter(
          (l) =>
            l.length > 0 &&
            l !==
              'Rule ID,Resource ID,Compliance,Exception Reason,Rule Level,Rule Info'
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
        '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."',
        '"Test-Non-Compliant","Stack1/rResource","Non-Compliant","N/A","Error","foo."',
      ];
      expect(
        getReportLines(
          reportLogger.getFormatStacks(NagReportFormat.CSV)[0]
        ).sort()
      ).toEqual(expectedOutput.sort());
    });
    test('Suppression values are written properly', () => {
      const stack = new Stack(app, 'Stack1');
      const resource = new CfnResource(stack, 'rResource', { type: 'foo' });
      NagSuppressions.addResourceSuppressions(resource, [
        {
          id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
          reason: 'lorem ipsum',
        },
      ]);
      app.synth();
      const expectedOutput = [
        '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."',
        '"Test-Non-Compliant","Stack1/rResource","Suppressed","lorem ipsum","Error","foo."',
      ];
      expect(
        getReportLines(
          reportLogger.getFormatStacks(NagReportFormat.CSV)?.[0] ?? ''
        ).sort()
      ).toEqual(expectedOutput.sort());
    });
    test('Suppression values are written properly when multibyte characters are used in reason', () => {
      const stack = new Stack(app, 'Stack1');
      const resource = new CfnResource(stack, 'rResource', { type: 'foo' });
      NagSuppressions.addResourceSuppressions(resource, [
        {
          id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
          reason: 'あいうえおかきくけこ',
        },
      ]);
      app.synth();
      const expectedOutput = [
        '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."',
        '"Test-Non-Compliant","Stack1/rResource","Suppressed","あいうえおかきくけこ","Error","foo."',
      ];
      expect(
        getReportLines(
          reportLogger.getFormatStacks(NagReportFormat.CSV)[0]
        ).sort()
      ).toEqual(expectedOutput.sort());
    });
    test('Error values are written properly', () => {
      const stack = new Stack(app, 'Stack1');
      const resource = new CfnResource(stack, 'rResource', { type: 'Error' });
      NagSuppressions.addResourceSuppressions(resource, [
        {
          id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
          reason: 'lorem ipsum',
        },
      ]);
      app.synth();
      const expectedOutput = [
        '"Test-Non-Compliant","Stack1/rResource","Suppressed","lorem ipsum","Error","foo."',
        '"Test-Compliant","Stack1/rResource","UNKNOWN","N/A","Error","foo."',
        '"Test-N/A","Stack1/rResource","UNKNOWN","N/A","Error","foo."',
      ];
      expect(
        getReportLines(
          reportLogger.getFormatStacks(NagReportFormat.CSV)[0]
        ).sort()
      ).toEqual(expectedOutput.sort());
    });
    test('Suppressed error values are escaped and written properly', () => {
      const stack = new Stack(app, 'Stack1');
      const resource = new CfnResource(stack, 'rResource', { type: 'Error' });
      NagSuppressions.addResourceSuppressions(resource, [
        { id: 'CdkNagValidationFailure', reason: '"quoted "lorem" ipsum"' },
      ]);
      app.synth();
      const expectedOutput = [
        '"Test-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."',
        '"Test-N/A","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."',
        '"Test-Non-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."',
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
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-Non-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Non-Compliant',
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
      ];
      expect(
        getReportLines(reportLogger.getFormatStacks(NagReportFormat.JSON)[0])
      ).toEqual(expect.arrayContaining(expectedOutput));
    });
    test('Suppression values are written properly', () => {
      const stack = new Stack(app, 'Stack1');
      const resource = new CfnResource(stack, 'rResource', { type: 'foo' });
      NagSuppressions.addResourceSuppressions(resource, [
        {
          id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
          reason: 'lorem ipsum',
        },
      ]);
      app.synth();
      const expectedOutput: NagReportLine[] = [
        {
          ruleId: 'Test-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Compliant',
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-Non-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Suppressed',
          exceptionReason: 'lorem ipsum',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
      ];
      expect(
        getReportLines(reportLogger.getFormatStacks(NagReportFormat.JSON)[0])
      ).toEqual(expect.arrayContaining(expectedOutput));
    });
    test('Suppression values are written properly when multibyte characters are used in reason', () => {
      const stack = new Stack(app, 'Stack1');
      const resource = new CfnResource(stack, 'rResource', { type: 'foo' });
      NagSuppressions.addResourceSuppressions(resource, [
        {
          id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
          reason: 'あいうえおかきくけこ',
        },
      ]);
      app.synth();
      const expectedOutput: NagReportLine[] = [
        {
          ruleId: 'Test-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Compliant',
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-Non-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Suppressed',
          exceptionReason: 'あいうえおかきくけこ',
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
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-Non-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'UNKNOWN',
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-N/A',
          resourceId: 'Stack1/rResource',
          compliance: 'UNKNOWN',
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
      ];
      expect(
        getReportLines(reportLogger.getFormatStacks(NagReportFormat.JSON)[0])
      ).toEqual(expect.arrayContaining(expectedOutput));
    });
    test('Error values are suppressed properly', () => {
      const stack = new Stack(app, 'Stack1');
      const resource = new CfnResource(stack, 'rResource', { type: 'Error' });
      NagSuppressions.addResourceSuppressions(resource, [
        {
          id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
          reason: 'lorem ipsum',
        },
      ]);
      app.synth();
      const expectedOutput: NagReportLine[] = [
        {
          ruleId: 'Test-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'UNKNOWN',
          exceptionReason: 'N/A',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-Non-Compliant',
          resourceId: 'Stack1/rResource',
          compliance: 'Suppressed',
          exceptionReason: 'lorem ipsum',
          ruleLevel: 'Error',
          ruleInfo: 'foo.',
        },
        {
          ruleId: 'Test-N/A',
          resourceId: 'Stack1/rResource',
          compliance: 'UNKNOWN',
          exceptionReason: 'N/A',
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

  test('should add an info annotation for INFO level', () => {
    const data: NagLoggerNonComplianceData = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'S3BucketInfo1',
      ruleOriginalName: 'S3BucketInfo1',
      ruleInfo: 'S3 bucket rule that will throw an info',
      ruleExplanation: 'This rule throws an info for a certain condition.',
      ruleLevel: NagMessageLevel.INFO,
      findingId: 'INFO.1',
    };
    logger.onNonCompliance(data);
    const meta = cfnBucket.node.metadata;
    expect(
      meta.some(
        (entry) =>
          entry.type === 'aws:cdk:info' &&
          (entry.data as string).includes('S3BucketInfo')
      )
    ).toBe(true);
  });

  test('should throw for unknown ruleLevel', () => {
    const data: any = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'UnknownRuleLevel',
      ruleOriginalName: 'UnknownRuleLevel',
      ruleInfo: 'This rule level is not recognized',
      ruleExplanation: 'Should throw an error for unknown rule level.',
      ruleLevel: 'UNKNOWN',
      findingId: 'FIND_UNKNOWN',
    };
    expect(() => logger.onNonCompliance(data)).toThrow(
      /Unrecognized message level/
    );
  });
});

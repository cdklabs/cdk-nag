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
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { IConstruct } from 'constructs';
import {
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagRuleCompliance,
  NagSuppressions,
} from '../src';
import { CsvReportLogger } from '../src/nag-logger';

describe('CsvReportLogger', () => {
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
          this.applyRule({
            ruleSuffixOverride: compliance,
            info: 'foo.',
            explanation: 'bar.',
            level: NagMessageLevel.ERROR,
            rule: function (node2: CfnResource): NagRuleCompliance {
              if (node2.cfnResourceType === 'N/A') {
                return NagRuleCompliance.NOT_APPLICABLE;
              } else if (node2.cfnResourceType !== 'Error') {
                return compliance;
              }
              throw Error('foobar');
            },
            node: node,
          });
        });
      }
    }
  }

  function getReportLines(app: App, reportStack: string): string[] {
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
  let app: App;
  let pack: NagPack;
  let csvTarget: CsvReportLogger;
  beforeEach(() => {
    app = new App();
    csvTarget = new CsvReportLogger();
    pack = new ReportPack({
      reports: false,
      additionalNagLoggers: [csvTarget],
    });
    Aspects.of(app).add(pack);
  });
  afterEach(() => {
    rmSync(app.outdir, { recursive: true });
  });
  test('Reports are generated for all stacks by default', () => {
    const stack = new Stack(app, 'Stack1');
    const stack2 = new Stack(app, 'Stack2');
    new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    new Bucket(stack2, 'rBucket');
    app.synth();
    expect(csvTarget.reportStacks.length).toEqual(2);
  });
  test('Reports are initialized for stacks with no relevant resources', () => {
    const stack = new Stack(app, 'Stack1');
    new CfnResource(stack, 'rNAResource', {
      type: 'N/A',
    });
    app.synth();
    expect(csvTarget.reportStacks.length).toEqual(1);
    expect(getReportLines(app, csvTarget.reportStacks[0]).length).toBe(0);
  });
  test('Nested Stack reports do not contain tokens in names', () => {
    const parent = new Stack(app, 'Parent');
    const nested = new NestedStack(parent, 'Child', {});
    new Bucket(parent, 'rBucket');
    new Bucket(nested, 'rBucket');
    app.synth();
    csvTarget.reportStacks.forEach((r) => {
      expect(Token.isUnresolved(r)).toBeFalsy();
    });
  });
  test('Compliant and Non-Compliant values are written properly', () => {
    const stack = new Stack(app, 'Stack1');
    new CfnResource(stack, 'rResource', { type: 'foo' });
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."',
      '"Test-Non-Compliant","Stack1/rResource","Non-Compliant","N/A","Error","foo."',
    ];
    expect(getReportLines(app, csvTarget.reportStacks[0]).sort()).toEqual(
      expectedOuput.sort()
    );
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
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","lorem ipsum","Error","foo."',
    ];
    expect(getReportLines(app, csvTarget.reportStacks[0]).sort()).toEqual(
      expectedOuput.sort()
    );
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
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","あいうえおかきくけこ","Error","foo."',
    ];
    expect(getReportLines(app, csvTarget.reportStacks[0]).sort()).toEqual(
      expectedOuput.sort()
    );
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
    const expectedOuput = [
      '"Test-Non-Compliant","Stack1/rResource","UNKNOWN","N/A","Error","foo."',
      '"Test-Compliant","Stack1/rResource","UNKNOWN","N/A","Error","foo."',
      '"Test-N/A","Stack1/rResource","UNKNOWN","N/A","Error","foo."',
    ];
    expect(getReportLines(app, csvTarget.reportStacks[0]).sort()).toEqual(
      expectedOuput.sort()
    );
  });
  test('Suppressed error values are escaped and written properly', () => {
    const stack = new Stack(app, 'Stack1');
    const resource = new CfnResource(stack, 'rResource', { type: 'Error' });
    NagSuppressions.addResourceSuppressions(resource, [
      { id: 'CdkNagValidationFailure', reason: '"quoted "lorem" ipsum"' },
    ]);
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."',
      '"Test-N/A","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."',
    ];
    expect(getReportLines(app, csvTarget.reportStacks[0]).sort()).toEqual(
      expectedOuput.sort()
    );
  });
});

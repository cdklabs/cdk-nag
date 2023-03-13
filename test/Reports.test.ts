/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  App,
  Aspects,
  CfnResource,
  Names,
  NestedStack,
  Stack,
  Token,
} from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { IConstruct } from 'constructs';
import {
  IApplyRule,
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagRuleCompliance,
  NagSuppressions,
} from '../src';

class ReportPack extends NagPack {
  lines = new Array<string>();
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

  protected writeToStackComplianceReport(
    params: IApplyRule,
    ruleId: string,
    compliance: NagRuleCompliance.COMPLIANT | NagRuleCompliance.NON_COMPLIANT,
    explanation: string = ''
  ): void {
    this.lines.push(
      this.createComplianceReportLine(params, ruleId, compliance, explanation)
    );
    const stackName = params.node.stack.nested
      ? Names.uniqueId(params.node.stack)
      : params.node.stack.stackName;
    const fileName = `${this.packName}-${stackName}-NagReport.csv`;
    if (!this.reportStacks.includes(fileName)) {
      this.reportStacks.push(fileName);
    }
  }
}

describe('Report system', () => {
  test('Reports are generated for all stacks by default', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const stack2 = new Stack(app, 'Stack2');
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    new Bucket(stack2, 'rBucket');
    app.synth();
    expect(pack.readReportStacks.length).toEqual(2);
  });
  test('Reports are initialized for stacks with no relevant resources', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    new CfnResource(stack, 'rNAResource', {
      type: 'N/A',
    });
    app.synth();
    expect(pack.readReportStacks.length).toEqual(1);
    expect(pack.lines.length).toBe(0);
  });
  test('Nested Stack reports do not contain tokens in names', () => {
    const app = new App();
    const parent = new Stack(app, 'Parent');
    const nested = new NestedStack(parent, 'Child', {});
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    new Bucket(parent, 'rBucket');
    new Bucket(nested, 'rBucket');
    app.synth();
    pack.readReportStacks.forEach((r) => {
      expect(Token.isUnresolved(r)).toBeFalsy();
    });
  });
  test('Compliant and Non-Compliant values are written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    new CfnResource(stack, 'rResource', { type: 'foo' });
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."\n',
      '"Test-Non-Compliant","Stack1/rResource","Non-Compliant","N/A","Error","foo."\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
  test('Suppression values are written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    const resource = new CfnResource(stack, 'rResource', { type: 'foo' });
    NagSuppressions.addResourceSuppressions(resource, [
      {
        id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
        reason: 'lorem ipsum',
      },
    ]);
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."\n',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","lorem ipsum","Error","foo."\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
  test('Suppression values are written properly when multibyte characters are used in reason', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    const resource = new CfnResource(stack, 'rResource', { type: 'foo' });
    NagSuppressions.addResourceSuppressions(resource, [
      {
        id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
        reason: 'あいうえおかきくけこ',
      },
    ]);
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error","foo."\n',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","あいうえおかきくけこ","Error","foo."\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
  test('Error values are written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    const resource = new CfnResource(stack, 'rResource', { type: 'Error' });
    NagSuppressions.addResourceSuppressions(resource, [
      {
        id: `${pack.readPackName}-${NagRuleCompliance.NON_COMPLIANT}`,
        reason: 'lorem ipsum',
      },
    ]);
    app.synth();
    const expectedOuput = [
      '"Test-Non-Compliant","Stack1/rResource","UNKNOWN","N/A","Error","foo."\n',
      '"Test-Compliant","Stack1/rResource","UNKNOWN","N/A","Error","foo."\n',
      '"Test-N/A","Stack1/rResource","UNKNOWN","N/A","Error","foo."\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
  test('Suppressed error values are escaped and written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new ReportPack();
    Aspects.of(app).add(pack);
    const resource = new CfnResource(stack, 'rResource', { type: 'Error' });
    NagSuppressions.addResourceSuppressions(resource, [
      { id: 'CdkNagValidationFailure', reason: '"quoted "lorem" ipsum"' },
    ]);
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."\n',
      '"Test-N/A","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."\n',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error","foo."\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
});

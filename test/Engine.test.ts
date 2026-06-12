/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  App,
  Aspects,
  CfnParameter,
  CfnResource,
  Stack,
  Validations,
} from 'aws-cdk-lib';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import {
  AwsSolutionsChecks,
  WriteNagSuppressionsToCloudFormationAspect,
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagRuleCompliance,
  NagRules,
} from '../src';

describe('Rule explanations', () => {
  test('Test no explicit explanation', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const pack = new AwsSolutionsChecks();
    const test1 = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test1.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const report = pack.validateScope(app);
    const descriptions = report.violations.map((v) => v.description);
    expect(descriptions.some((d) => d.includes('Large port ranges'))).toBe(
      false
    );
  });
  test('Test no explanation', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const pack = new AwsSolutionsChecks(undefined, { verbose: false });
    const test1 = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test1.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const report = pack.validateScope(app);
    const descriptions = report.violations.map((v) => v.description);
    expect(descriptions.some((d) => d.includes('Large port ranges'))).toBe(
      false
    );
  });
  test('Test explanation', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const pack = new AwsSolutionsChecks(undefined, { verbose: true });
    const test1 = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test1.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const report = pack.validateScope(app);
    const descriptions = report.violations.map((v) => v.description);
    expect(descriptions.some((d) => d.includes('Large port ranges'))).toBe(
      true
    );
  });
});

describe('Rule exception handling', () => {
  const ERROR_MESSAGE = 'oops!';
  class BadPack extends NagPack {
    public readonly name = 'Bad';
    constructor(scope?: any, props?: NagPackProps) {
      super(scope, props);
      this.packName = 'Bad.Pack';
    }
    protected checkResource(node: CfnResource): void {
      this.applyRule({
        ruleSuffixOverride: 'BadRule',
        info: 'This is an improperly made rule.',
        explanation: 'This will throw an error',
        level: NagMessageLevel.ERROR,
        rule: function (node2: CfnResource): NagRuleCompliance {
          if (node2) {
            throw Error(ERROR_MESSAGE);
          }
          return NagRuleCompliance.NON_COMPLIANT;
        },
        node: node,
      });
    }
  }
  test('Error is properly caught', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new CfnBucket(stack, 'rBucket');
    const pack = new BadPack();
    const report = pack.validateScope(app);
    expect(
      report.violations.some((v) => v.ruleName === 'Bad.Pack-BadRule')
    ).toBe(true);
  });
  test('Error properly handles verbose logging', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new CfnBucket(stack, 'rBucket');
    const pack = new BadPack(undefined, { verbose: true });
    const report = pack.validateScope(app);
    expect(
      report.violations.some((v) => v.description.includes(ERROR_MESSAGE))
    ).toBe(true);
  });
  test('Encoded Intrinsic function with resolveIfPrimitive error handling', () => {
    const stack = new Stack();
    const param = new CfnParameter(stack, 'pParam', {
      type: 'Number',
      default: 42,
    });
    const bucket = new CfnBucket(stack, 'rBucket', {
      bucketName: param.valueAsString,
    });
    expect(() => {
      NagRules.resolveIfPrimitive(bucket, bucket.bucketName);
    }).toThrowError('{"Ref":"pParam"}');
    expect(() => {
      NagRules.resolveIfPrimitive(bucket, bucket.objectLockEnabled);
    }).not.toThrowError();
  });
});

describe('Basic rule validation', () => {
  test('Non-compliant resource produces violation', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const sg = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const pack = new AwsSolutionsChecks();
    const report = pack.validateScope(app);
    expect(
      report.violations.some((v) => v.ruleName === 'AwsSolutions-EC23')
    ).toBe(true);
  });
  test('Compliant resource does not produce violation', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    const pack = new AwsSolutionsChecks();
    const report = pack.validateScope(app);
    expect(
      report.violations.some((v) => v.ruleName === 'AwsSolutions-EC23')
    ).toBe(false);
  });
});

describe('Acknowledgment suppression', () => {
  test('Acknowledged rules are suppressed from violations', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const sg = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const cfnSg = sg.node.defaultChild as CfnResource;
    Validations.of(cfnSg).acknowledge({
      id: 'AwsSolutions-EC23',
      reason: 'Internal testing security group',
    });
    const pack = new AwsSolutionsChecks();
    const report = pack.validateScope(app);
    expect(
      report.violations.some((v) => v.ruleName === 'AwsSolutions-EC23')
    ).toBe(false);
  });
});

describe('Audit trail metadata persistence', () => {
  test('WriteNagSuppressionsToCloudFormationAspect writes acknowledged rules to CfnResource metadata', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const sg = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const cfnSg = sg.node.defaultChild as CfnResource;
    Validations.of(cfnSg).acknowledge({
      id: 'AwsSolutions-EC23',
      reason: 'Internal testing security group',
    });
    Aspects.of(app).add(new WriteNagSuppressionsToCloudFormationAspect());
    app.synth();
    const metadata = cfnSg.getMetadata('cdk_nag');
    expect(metadata).toBeDefined();
    expect(metadata.rules_to_suppress).toContainEqual(
      expect.objectContaining({
        id: 'AwsSolutions-EC23',
        reason: 'Internal testing security group',
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils, stringLike } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import {
  CfnSecurityGroup,
  Peer,
  Port,
  SecurityGroup,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { CfnBucket } from '@aws-cdk/aws-s3';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks, NagMessageLevel, NagPack } from '../src';

describe('Testing rule suppression with complete metadata', () => {
  test('Test single rule suppression', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn = test.node.defaultChild as CfnSecurityGroup;
    testCfn.addMetadata('cdk_nag', {
      rules_to_suppress: [{ id: 'AwsSolutions-EC23', reason: 'lorem ipsum' }],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-EC23:'),
        }),
      })
    );
  });
  test('Test rule suppression does not overrite aws:cdk:path', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn = test.node.defaultChild as CfnSecurityGroup;
    testCfn.cfnOptions.metadata = {
      'aws:cdk:path': 'Default/test/SecurityGroup/Resource',
    };
    testCfn.addMetadata('cdk_nag', {
      rules_to_suppress: [{ id: 'AwsSolutions-EC23', reason: 'lorem ipsum' }],
    });
    const synthed = SynthUtils.synthesize(stack);
    expect(synthed).toHaveResourceLike(
      'AWS::EC2::SecurityGroup',
      {
        Metadata: {
          'aws:cdk:path': stringLike('*Resource*'),
          cdk_nag: {
            rules_to_suppress: [
              { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
            ],
          },
        },
      },
      1
    );
  });
  test('Test multi rule suppression', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn = test.node.defaultChild as CfnSecurityGroup;
    testCfn.addMetadata('cdk_nag', {
      rules_to_suppress: [
        { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
        { id: 'AwsSolutions-EC27', reason: 'dolor sit amet' },
      ],
    });

    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-EC23:'),
        }),
      })
    );
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-EC27:'),
        }),
      })
    );
  });
  test('Throw error on improperly formatted suppression', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn = test.node.defaultChild as CfnSecurityGroup;
    testCfn.addMetadata('cdk_nag', {
      rules_to_suppress: [{}],
    });
    expect(() => {
      SynthUtils.synthesize(stack);
    }).toThrowError(
      'Improperly formatted cdk_nag rule suppression detected. See https://github.com/cdklabs/cdk-nag#suppressing-a-rule for information on suppressing a rule.'
    );
  });
});

describe('Testing rule explanations', () => {
  test('Test no explicit explanation', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('Large port ranges'),
        }),
      })
    );
  });
  test('Test no explanation', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: false }));
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('Large port ranges'),
        }),
      })
    );
  });
  test('Test explanation', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('Large port ranges'),
        }),
      })
    );
  });
});

describe('Testing rule exception handling', () => {
  const ERROR_MESSAGE = 'oops!';
  class BadPack extends NagPack {
    public visit(node: IConstruct): void {
      if (node instanceof CfnResource) {
        this.applyRule({
          ruleId: 'Bad.Pack-BadRule',
          info: 'This is a imporperly made rule.',
          explanation: 'This will throw an error',
          level: NagMessageLevel.ERROR,
          rule: function (node2: CfnResource): boolean {
            if (node2) {
              throw Error(ERROR_MESSAGE);
            }
            return false;
          },
          ignores: node.getMetadata('cdk_nag')?.rules_to_suppress,
          node: node,
        });
      }
    }
  }
  test('Error is properly caught', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack());
    new CfnBucket(stack, 'rBucket');
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CdkNagValidationFailure:'),
        }),
      })
    );
  });
  test('Error properly handles verbose logging', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ verbose: true }));
    new CfnBucket(stack, 'rBucket');
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(ERROR_MESSAGE),
        }),
      })
    );
  });
  test('Error can be suppressed', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ verbose: true }));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        { id: 'CdkNagValidationFailure', reason: 'at least 10 characters' },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CdkNagValidationFailure:'),
        }),
      })
    );
  });
});

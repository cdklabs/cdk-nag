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
import { PolicyStatement, User } from '@aws-cdk/aws-iam';
import { CfnBucket } from '@aws-cdk/aws-s3';
import {
  Aspects,
  CfnParameter,
  CfnResource,
  IConstruct,
  Stack,
} from '@aws-cdk/core';
import {
  addResourceSuppressions,
  addStackSuppressions,
  AwsSolutionsChecks,
  NagMessageLevel,
  NagPack,
  resolveIfPrimitive,
} from '../src';

describe('Testing rule suppression system', () => {
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
  test('Test addResourceSuppressions function does not overrite aws:cdk:path', () => {
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
    addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
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
  test('Test supressions with addResourceSuppressions function on a CfnResource based Construct', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
      { id: 'AwsSolutions-EC27', reason: 'dolor sit amet' },
    ]);
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
  test('addResourceSuppressions function does not override previous suppressions on a CfnResource based Construct', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
    addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC27', reason: 'dolor sit amet' },
    ]);
    const synthed = SynthUtils.synthesize(stack);
    expect(synthed).toHaveResourceLike(
      'AWS::EC2::SecurityGroup',
      {
        Metadata: {
          cdk_nag: {
            rules_to_suppress: [
              { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
              { id: 'AwsSolutions-EC27', reason: 'dolor sit amet' },
            ],
          },
        },
      },
      1
    );
  });
  test('addStackSuppressions function does not override previous suppressions on a Stack', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    stack.templateOptions.metadata = { foo: 'bar' };
    addStackSuppressions(stack, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
    addStackSuppressions(stack, [
      { id: 'AwsSolutions-EC27', reason: 'dolor sit amet' },
    ]);
    expect(stack.templateOptions.metadata).toMatchObject({
      foo: 'bar',
      cdk_nag: {
        rules_to_suppress: [
          { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
          { id: 'AwsSolutions-EC27', reason: 'dolor sit amet' },
        ],
      },
    });
  });
  test('addResourceSuppressions function enabled for dependant constructs', () => {
    const stack = new Stack();
    const user = new User(stack, 'rUser');
    user.addToPolicy(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: ['*'],
      })
    );
    addResourceSuppressions(
      user,
      [
        {
          id: 'AwsSolutions-IAM5',
          reason:
            'The user is allowed to put objects on all prefixes in the specified bucket.',
        },
      ],
      true
    );
    const synthed = SynthUtils.synthesize(stack);
    expect(synthed).toHaveResourceLike(
      'AWS::IAM::Policy',
      {
        Metadata: {
          cdk_nag: {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-IAM5',
                reason:
                  'The user is allowed to put objects on all prefixes in the specified bucket.',
              },
            ],
          },
        },
      },
      1
    );
  });
  test('addResourceSuppressions function disabled for dependant constructs', () => {
    const stack = new Stack();
    const user = new User(stack, 'rUser');
    user.addToPolicy(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: ['*'],
      })
    );
    addResourceSuppressions(user, [
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'The user is allowed to put objects on all prefixes in the specified bucket.',
      },
    ]);
    const synthed = SynthUtils.synthesize(stack);
    expect(synthed).not.toHaveResourceLike(
      'AWS::IAM::Policy',
      {
        Metadata: {
          cdk_nag: {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-IAM5',
                reason:
                  'The user is allowed to put objects on all prefixes in the specified bucket.',
              },
            ],
          },
        },
      },
      1
    );
  });
  test('combined supressions with addResourceSuppressions and addStackSuppressions', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    addStackSuppressions(stack, [
      { id: 'AwsSolutions-EC27', reason: 'dolor sit amet' },
    ]);
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
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
      resolveIfPrimitive(bucket, bucket.bucketName);
    }).toThrowError('{"Ref":"pParam"}');
    expect(() => {
      resolveIfPrimitive(bucket, bucket.objectLockEnabled);
    }).not.toThrowError();
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { stringLike, SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import {
  Aspects,
  CfnParameter,
  CfnResource,
  NestedStack,
  Stack,
} from 'aws-cdk-lib';
import {
  CfnRoute,
  CfnSecurityGroup,
  Peer,
  Port,
  SecurityGroup,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement, User } from 'aws-cdk-lib/aws-iam';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { IConstruct } from 'constructs';
import {
  AwsSolutionsChecks,
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagRuleCompliance,
  NagRules,
  NagSuppressions,
  SuppressionIgnoreAlways,
} from '../src';
import { expectMessages } from './test-utils';

describe('Rule suppression system', () => {
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
    expectMessages(messages, { notContaining: ['AwsSolutions-EC23:'] });
  });
  test('Fine grained permission cannot be added via rule id [resource]', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const user = new User(stack, 'rUser');
    expect(() =>
      NagSuppressions.addResourceSuppressions(
        user,
        [
          {
            id: 'AwsSolutions-IAM5[Action::s3:*]',
            reason: 'Incorrect suppression.',
          },
        ],
        true
      )
    ).toThrowError();
  });
  test('Fine grained permission cannot be added via rule id [stack]', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    new User(stack, 'rUser');
    expect(() =>
      NagSuppressions.addStackSuppressions(
        stack,
        [
          {
            id: 'AwsSolutions-IAM5[Action::s3:*]',
            reason: 'Incorrect suppression.',
          },
        ],
        true
      )
    ).toThrowError();
  });
  test('Test granular suppression when suppressed coarsely', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const user = new User(stack, 'rUser');
    user.addToPolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['*'],
      })
    );
    NagSuppressions.addResourceSuppressions(
      user,
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Every finding is suppressed.',
        },
      ],
      true
    );
    const { messages } = SynthUtils.synthesize(stack);
    expectMessages(messages, {
      notContaining: [
        'AwsSolutions-IAM5[Action::s3:*]:',
        'AwsSolutions-IAM5[Resource::*]:',
      ],
    });
  });
  test('Test granular suppression when suppressed finely', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const user = new User(stack, 'rUser');
    user.addToPolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['*'],
      })
    );
    NagSuppressions.addResourceSuppressions(
      user,
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Every finding is suppressed.',
          appliesTo: ['Action::s3:*'],
        },
      ],
      true
    );
    const { messages } = SynthUtils.synthesize(stack);

    expectMessages(messages, {
      notContaining: ['AwsSolutions-IAM5[Action::s3:*]:'],
      containing: ['AwsSolutions-IAM5[Resource::*]:'],
    });
  });
  test('Test granular suppression when suppressed finely with a RegExp', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const user = new User(stack, 'rUser');
    user.addToPolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['some-arn:mybucket/*'],
      })
    );
    NagSuppressions.addResourceSuppressions(
      user,
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Suppression based on resource arn',
          appliesTo: [{ regex: /^Resource::(.*):mybucket\/\*$/g.toString() }],
        },
      ],
      true
    );
    const { messages } = SynthUtils.synthesize(stack);
    expectMessages(messages, {
      containing: ['AwsSolutions-IAM5[Action::s3:*]:'],
      notContaining: ['AwsSolutions-IAM5[Resource::some-arn:mybucket/*]:'],
    });
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
              {
                id: 'AwsSolutions-EC23',
                reason: 'lorem ipsum',
              },
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
    NagSuppressions.addResourceSuppressions(test, [
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
              {
                id: 'AwsSolutions-EC23',
                reason: 'lorem ipsum',
              },
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
        {
          id: 'AwsSolutions-EC2SecurityGroupDescription',
          reason: 'dolor sit amet',
        },
      ],
    });

    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: [
        'AwsSolutions-EC23:',
        'AwsSolutions-EC2SecurityGroupDescription:',
      ],
    });
  });
  test('Test multi resource suppression', () => {
    const stack = new Stack();
    const vpc = new Vpc(stack, 'rVpc');
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test1 = new SecurityGroup(stack, 'rSg1', { vpc });
    test1.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn1 = test1.node.defaultChild as CfnSecurityGroup;
    testCfn1.cfnOptions.metadata = {
      'aws:cdk:path1': 'Default/test/SecurityGroup/Resource',
    };
    const test2 = new SecurityGroup(stack, 'rSg2', { vpc });
    test2.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn2 = test2.node.defaultChild as CfnSecurityGroup;
    testCfn2.cfnOptions.metadata = {
      'aws:cdk:path2': 'Default/test/SecurityGroup/Resource',
    };
    NagSuppressions.addResourceSuppressions(
      [test1, test2],
      [{ id: 'AwsSolutions-EC23', reason: 'lorem ipsum' }]
    );
    const synthed = SynthUtils.synthesize(stack);
    expect(synthed).toHaveResourceLike(
      'AWS::EC2::SecurityGroup',
      {
        Metadata: {
          'aws:cdk:path1': stringLike('*Resource*'),
          cdk_nag: {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-EC23',
                reason: 'lorem ipsum',
              },
            ],
          },
        },
      },
      1
    );
    expect(synthed).toHaveResourceLike(
      'AWS::EC2::SecurityGroup',
      {
        Metadata: {
          'aws:cdk:path2': stringLike('*Resource*'),
          cdk_nag: {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-EC23',
                reason: 'lorem ipsum',
              },
            ],
          },
        },
      },
      1
    );
  });
  test('Multi resource suppression does not duplicate', () => {
    const stack = new Stack();
    const vpc = new Vpc(stack, 'rVPC');
    const suppressions = [
      {
        id: 'foo',
        reason: 'Never gonna give you up.',
      },
    ];
    NagSuppressions.addResourceSuppressions([vpc, vpc], suppressions, true);
    SynthUtils.synthesize(stack);
    for (const child of vpc.node.findAll()) {
      if (child instanceof CfnResource) {
        expect(child.getMetadata('cdk_nag')?.rules_to_suppress).toEqual(
          suppressions
        );
      }
    }
  });
  test('Resource array cannot be empty', () => {
    expect(() =>
      NagSuppressions.addResourceSuppressions(
        [],
        [{ id: 'AwsSolutions-EC23', reason: 'lorem ipsum' }]
      )
    ).toThrowError();
  });
  test('Test suppressions with addResourceSuppressions function on a CfnResource based Construct', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    NagSuppressions.addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
      {
        id: 'AwsSolutions-EC2SecurityGroupDescription',
        reason: 'dolor sit amet',
      },
    ]);
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: [
        'AwsSolutions-EC23:',
        'AwsSolutions-EC2SecurityGroupDescription:',
      ],
    });
  });
  test('addResourceSuppressions function does not override previous suppressions on a CfnResource based Construct', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    NagSuppressions.addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
    NagSuppressions.addResourceSuppressions(test, [
      {
        id: 'AwsSolutions-EC2SecurityGroupDescription',
        reason: 'dolor sit amet',
      },
    ]);
    const synthed = SynthUtils.synthesize(stack);
    expect(synthed).toHaveResourceLike(
      'AWS::EC2::SecurityGroup',
      {
        Metadata: {
          cdk_nag: {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-EC23',
                reason: 'lorem ipsum',
              },
              {
                id: 'AwsSolutions-EC2SecurityGroupDescription',
                reason: 'dolor sit amet',
              },
            ],
          },
        },
      },
      1
    );
  });
  test('Test suppressions with addResourceSuppressionsByPath function on a CfnResource based Construct', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    NagSuppressions.addResourceSuppressionsByPath(stack, test.node.path, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
      {
        id: 'AwsSolutions-EC2SecurityGroupDescription',
        reason: 'dolor sit amet',
      },
    ]);
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: [
        'AwsSolutions-EC23:',
        'AwsSolutions-EC2SecurityGroupDescription:',
      ],
    });
  });
  test('Test suppressions with addResourceSuppressionsByPath on multiple resources', () => {
    const stack = new Stack();
    const vpc = new Vpc(stack, 'rVpc');
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test1 = new SecurityGroup(stack, 'rSg1', {
      vpc,
    });
    test1.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn1 = test1.node.defaultChild as CfnSecurityGroup;
    testCfn1.cfnOptions.metadata = {
      'aws:cdk:path1': 'Default/test/SecurityGroup/Resource',
    };
    const test2 = new SecurityGroup(stack, 'rSg2', {
      vpc,
    });
    test1.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const testCfn2 = test2.node.defaultChild as CfnSecurityGroup;
    testCfn2.cfnOptions.metadata = {
      'aws:cdk:path2': 'Default/test/SecurityGroup/Resource',
    };
    NagSuppressions.addResourceSuppressionsByPath(
      stack,
      [test1.node.path, test2.node.path],
      [{ id: 'AwsSolutions-EC23', reason: 'lorem ipsum' }]
    );
    const synthed = SynthUtils.synthesize(stack);
    expect(synthed).toHaveResourceLike(
      'AWS::EC2::SecurityGroup',
      {
        Metadata: {
          'aws:cdk:path1': stringLike('*Resource*'),
          cdk_nag: {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-EC23',
                reason: 'lorem ipsum',
              },
            ],
          },
        },
      },
      1
    );
    expect(synthed).toHaveResourceLike(
      'AWS::EC2::SecurityGroup',
      {
        Metadata: {
          'aws:cdk:path2': stringLike('*Resource*'),
          cdk_nag: {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-EC23',
                reason: 'lorem ipsum',
              },
            ],
          },
        },
      },
      1
    );
  });
  test('addResourceSuppressionsByPath on multiple resources does not duplicate', () => {
    const stack = new Stack();
    const vpc = new Vpc(stack, 'rVpc');
    const suppressions = [
      {
        id: 'foo',
        reason: 'Never gonna give you up.',
      },
    ];
    NagSuppressions.addResourceSuppressionsByPath(
      stack,
      [vpc.node.path, vpc.node.path],
      suppressions,
      true
    );
    SynthUtils.synthesize(stack);
    for (const child of vpc.node.findAll()) {
      if (child instanceof CfnResource) {
        expect(child.getMetadata('cdk_nag')?.rules_to_suppress).toEqual(
          suppressions
        );
      }
    }
  });
  test('Path array of addResourceSuppressionsByPath cannot be empty', () => {
    const stack = new Stack();
    expect(() =>
      NagSuppressions.addResourceSuppressionsByPath(
        stack,
        [],
        [{ id: 'AwsSolutions-EC23', reason: 'lorem ipsum' }]
      )
    ).toThrowError();
  });
  test('addStackSuppressions function does not override previous suppressions on a Stack', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    stack.templateOptions.metadata = { foo: 'bar' };
    NagSuppressions.addStackSuppressions(stack, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
    NagSuppressions.addStackSuppressions(stack, [
      {
        id: 'AwsSolutions-EC2SecurityGroupDescription',
        reason: 'dolor sit amet',
      },
    ]);
    expect(stack.templateOptions.metadata).toMatchObject({
      foo: 'bar',
      cdk_nag: {
        rules_to_suppress: [
          { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
          {
            id: 'AwsSolutions-EC2SecurityGroupDescription',
            reason: 'dolor sit amet',
          },
        ],
      },
    });
  });
  test('addStackSuppressions function only applies new Suppressions once to dependant stacks', () => {
    const stack = new Stack();
    const nestedStack1 = new NestedStack(stack, 'rNestedStack1');
    const nestedStack2 = new Stack(stack, 'rNestedStack2');
    const suppression = [
      {
        id: 'AwsSolutions-EC23',
        reason: 'lorem ipsum',
      },
    ];
    NagSuppressions.addStackSuppressions(stack, suppression, true);
    const rootMetadata =
      stack.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    const nested1Metadata =
      nestedStack1.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    const nested2Metadata =
      nestedStack2.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    expect(rootMetadata).toEqual(suppression);
    expect(nested1Metadata).toEqual(suppression);
    expect(nested2Metadata).toEqual(suppression);
  });
  test('addStackSuppressions function does not apply duplicate suppression', () => {
    const stack = new Stack();
    const nestedStack1 = new NestedStack(stack, 'rNestedStack1');
    const nestedStack2 = new Stack(stack, 'rNestedStack2');
    const suppression = [
      {
        id: 'AwsSolutions-EC23',
        reason: 'lorem ipsum',
      },
      {
        id: 'AwsSolutions-EC23',
        reason: 'lorem ipsum dolor',
      },
    ];
    const duplicate = [
      {
        id: 'AwsSolutions-EC23',
        reason: 'lorem ipsum',
      },
    ];
    NagSuppressions.addStackSuppressions(
      stack,
      suppression.concat(duplicate),
      true
    );
    const rootMetadata =
      stack.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    const nested1Metadata =
      nestedStack1.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    const nested2Metadata =
      nestedStack2.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    expect(rootMetadata).toEqual(suppression);
    expect(nested1Metadata).toEqual(suppression);
    expect(nested2Metadata).toEqual(suppression);
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
    NagSuppressions.addResourceSuppressions(
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
  test('addResourceSuppressions function only applies new Suppressions once to dependant constructs', () => {
    const stack = new Stack();
    const vpc = new Vpc(stack, 'rVPC');
    vpc.addFlowLog('rFlowLog1');
    vpc.addFlowLog('rFlowLog2');
    vpc.addFlowLog('rFlowLog3');
    const suppressions = [
      {
        id: 'foo',
        reason: 'Never gonna give you up.',
      },
      {
        id: 'foo',
        reason: 'Never gonna let you down.',
      },
      {
        id: 'bar',
        reason: 'Never gonna run around and desert you.',
      },
      {
        id: 'baz',
        reason: 'Never gonna make you cry.',
      },
      {
        id: 'qux',
        reason: 'Never gonna say goodbye.',
      },
      {
        id: 'quux',
        reason: 'Never gonna tell a lie and hurt you.',
      },
    ];
    NagSuppressions.addResourceSuppressions(vpc, suppressions, true);
    SynthUtils.synthesize(stack);
    for (const child of vpc.node.findAll()) {
      if (child instanceof CfnResource) {
        expect(child.getMetadata('cdk_nag')?.rules_to_suppress).toEqual(
          suppressions
        );
      }
    }
  });
  test('addResourceSuppressions function does not apply duplicate suppression', () => {
    const stack = new Stack();
    const vpc = new Vpc(stack, 'rVPC');
    vpc.addFlowLog('rFlowLog1');
    vpc.addFlowLog('rFlowLog2');
    vpc.addFlowLog('rFlowLog3');
    const suppressions = [
      {
        id: 'foo',
        reason: 'Never gonna give you up.',
      },
      {
        id: 'foo',
        reason: 'Never gonna let you down.',
      },
      {
        id: 'bar',
        reason: 'Never gonna run around and desert you.',
      },
    ];
    const duplicate = [
      {
        id: 'bar',
        reason: 'Never gonna run around and desert you.',
      },
    ];
    NagSuppressions.addResourceSuppressions(
      vpc,
      suppressions.concat(duplicate),
      true
    );
    SynthUtils.synthesize(stack);
    for (const child of vpc.node.findAll()) {
      if (child instanceof CfnResource) {
        expect(child.getMetadata('cdk_nag')?.rules_to_suppress).toEqual(
          suppressions
        );
      }
    }
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
    NagSuppressions.addResourceSuppressions(user, [
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
  test('combined suppressions with addResourceSuppressions and addStackSuppressions', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    NagSuppressions.addStackSuppressions(stack, [
      {
        id: 'AwsSolutions-EC2SecurityGroupDescription',
        reason: 'dolor sit amet',
      },
    ]);
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    NagSuppressions.addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: [
        'AwsSolutions-EC23:',
        'AwsSolutions-EC2SecurityGroupDescription:',
      ],
    });
  });
  test('Resource suppressions change metadata on L1 Constructs', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new CfnRoute(stack, 'CfnRoute', { routeTableId: 'foo' });
    const suppression = {
      id: 'AwsSolutions-EC23',
      reason: 'lorem ipsum',
    };
    NagSuppressions.addResourceSuppressions(test, [suppression]);
    const metadata = test.getMetadata('cdk_nag')?.rules_to_suppress;
    expect(metadata).toContainEqual(expect.objectContaining(suppression));
  });
  test('Reason containing multibyte characters is base64 encoded', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new CfnRoute(stack, 'CfnRoute', { routeTableId: 'foo' });
    const suppression = {
      id: 'AwsSolutions-EC23',
      reason: 'あいうえおかきくけこ',
    };
    const suppressionInMetadata = {
      id: 'AwsSolutions-EC23',
      reason: '44GC44GE44GG44GI44GK44GL44GN44GP44GR44GT',
      is_reason_encoded: true,
    };
    NagSuppressions.addResourceSuppressions(test, [suppression]);
    const metadata = test.getMetadata('cdk_nag')?.rules_to_suppress;
    expect(metadata).toContainEqual(
      expect.objectContaining(suppressionInMetadata)
    );
  });
  test('suppressed rule logging enabled', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks({ logIgnores: true }));
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    NagSuppressions.addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: ['CdkNagSuppression: AwsSolutions-EC23'],
    });
  });
  test('suppressed rule logging disabled', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
      description: '',
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    NagSuppressions.addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: ['CdkNagSuppression: AwsSolutions-EC23'],
    });
  });
  test('Test path miss', () => {
    const stack = new Stack();
    try {
      NagSuppressions.addResourceSuppressionsByPath(stack, '/No/Such/Path', [
        { id: 'NA', reason: '............' },
      ]);
      throw new Error('Did not fail');
    } catch (err) {
      expect(err + '').toBe(
        `Error: Suppression path "/No/Such/Path" did not match any resource. This can occur when a resource does not exist or if a suppression is applied before a resource is created.`
      );
    }
  });
});

describe('Rule explanations', () => {
  test('Test no explicit explanation', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks());
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: ['Large port ranges'],
    });
  });
  test('Test no explanation', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: false }));
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: ['Large port ranges'],
    });
  });
  test('Test explanation', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
    const test = new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: ['Large port ranges'],
    });
  });
});

describe('Rule exception handling', () => {
  const ERROR_MESSAGE = 'oops!';
  class BadPack extends NagPack {
    constructor(props?: NagPackProps, packName?: string) {
      super(props);
      this.packName = packName ?? 'Bad.Pack';
    }
    public visit(node: IConstruct): void {
      if (node instanceof CfnResource) {
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
  }
  test('Error is properly caught', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack());
    new CfnBucket(stack, 'rBucket');
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: ['CdkNagValidationFailure[Bad.Pack-BadRule]:'],
    });
  });
  test('Error properly handles verbose logging', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ verbose: true }));
    new CfnBucket(stack, 'rBucket');
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: [ERROR_MESSAGE],
    });
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
    expectMessages(messages, {
      notContaining: ['CdkNagValidationFailure[Bad.Pack-BadRule]:'],
    });
  });
  test('Specific errors can be suppressed', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ verbose: true }, 'Bad.Pack.1'));
    Aspects.of(stack).add(new BadPack({ verbose: true }, 'Bad.Pack.2'));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        {
          id: 'CdkNagValidationFailure',
          reason: 'at least 10 characters',
          appliesTo: ['Bad.Pack.1-BadRule'],
        },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: ['CdkNagValidationFailure[Bad.Pack.1-BadRule]:'],
      containing: ['CdkNagValidationFailure[Bad.Pack.2-BadRule]:'],
    });
  });
  test('Suppressing a rule suppresses errors for the rule', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ verbose: true }, 'Bad.Pack.1'));
    Aspects.of(stack).add(new BadPack({ verbose: true }, 'Bad.Pack.2'));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        {
          id: 'Bad.Pack.1-BadRule',
          reason: 'at least 10 characters',
        },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      notContaining: ['CdkNagValidationFailure[Bad.Pack.1-BadRule]:'],
      containing: ['CdkNagValidationFailure[Bad.Pack.2-BadRule]:'],
    });
  });
  test.each([
    [
      'NagPack level suppression',
      {
        id: 'Bad.Pack.1-BadRule',
        reason: 'at least 10 characters',
      },
    ],
    [
      'CdkNagValidationFailure suppression',
      {
        id: 'CdkNagValidationFailure',
        reason: 'at least 10 characters',
      },
    ],
    [
      'CdkNagValidationFailure granular suppression',
      {
        id: 'CdkNagValidationFailure',
        reason: 'at least 10 characters',
        appliesTo: ['Bad.Pack.1-BadRule'],
      },
    ],
  ])(
    'Suppression ignore conditions apply to exceptions with %s',
    (_testName, suppressionRule) => {
      const stack = new Stack();
      Aspects.of(stack).add(
        new BadPack(
          {
            suppressionIgnoreCondition: new SuppressionIgnoreAlways('IGNORED.'),
          },
          'Bad.Pack.1'
        )
      );
      new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
        rules_to_suppress: [suppressionRule],
      });
      const messages = SynthUtils.synthesize(stack).messages;
      expectMessages(messages, {
        containing: [
          'CdkNagValidationFailure[Bad.Pack.1-BadRule]:',
          'The suppression for Bad.Pack.1-BadRule was ignored',
        ],
      });
    }
  );
  test('Suppressing CdkNagValidationFailure still suppresses other failures when one has a suppression ignore', () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new BadPack(
        {
          suppressionIgnoreCondition: new SuppressionIgnoreAlways('IGNORED.'),
        },
        'Bad.Pack.1'
      )
    );
    Aspects.of(stack).add(new BadPack({ verbose: true }, 'Bad.Pack.2'));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        {
          id: 'CdkNagValidationFailure',
          reason: 'at least 10 characters',
        },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: [
        'CdkNagValidationFailure[Bad.Pack.1-BadRule]:',
        'The suppression for Bad.Pack.1-BadRule was ignored',
      ],
      notContaining: ['CdkNagValidationFailure[Bad.Pack.2-BadRule]:'],
    });
  });
  test('Granularly suppressing a rule does not suppress errors for the rule', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ verbose: true }, 'Bad.Pack.1'));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        {
          id: 'Bad.Pack.1-BadRule',
          reason: 'at least 10 characters',
          appliesTo: ['foo'],
        },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: ['CdkNagValidationFailure[Bad.Pack.1-BadRule]:'],
    });
  });
  test('Suppressed validation error is logged with suppressed rule logging', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ logIgnores: true }));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        { id: 'CdkNagValidationFailure', reason: 'at least 10 characters' },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: [
        'CdkNagSuppression[Bad.Pack-BadRule]: CdkNagValidationFailure',
      ],
    });
  });
  test('Suppressed validation error is logged with specifically suppressed rule logging', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ logIgnores: true }, 'Bad.Pack.1'));
    Aspects.of(stack).add(new BadPack({}, 'Bad.Pack.2'));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        {
          id: 'CdkNagValidationFailure',
          reason: 'at least 10 characters',
          appliesTo: ['Bad.Pack.1-BadRule'],
        },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expectMessages(messages, {
      containing: [
        'CdkNagSuppression[Bad.Pack.1-BadRule]: CdkNagValidationFailure',
        'CdkNagValidationFailure[Bad.Pack.2-BadRule]:',
      ],
    });
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

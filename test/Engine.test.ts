/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils, stringLike } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import {
  CfnRoute,
  CfnSecurityGroup,
  Peer,
  Port,
  SecurityGroup,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { PolicyStatement, User } from '@aws-cdk/aws-iam';
import { Bucket, CfnBucket } from '@aws-cdk/aws-s3';
import {
  App,
  Aspects,
  CfnParameter,
  CfnResource,
  IConstruct,
  NestedStack,
  Stack,
} from '@aws-cdk/core';
import {
  NagSuppressions,
  AwsSolutionsChecks,
  NagMessageLevel,
  NagPack,
  resolveIfPrimitive,
  NagPackProps,
  NagRuleCompliance,
  IApplyRule,
} from '../src';

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
          data: expect.stringContaining(
            'AwsSolutions-EC2SecurityGroupDescription:'
          ),
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
    NagSuppressions.addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
      {
        id: 'AwsSolutions-EC2SecurityGroupDescription',
        reason: 'dolor sit amet',
      },
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
          data: expect.stringContaining(
            'AwsSolutions-EC2SecurityGroupDescription:'
          ),
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
  test('Test supressions with addResourceSuppressionByPath function on a CfnResource based Construct', () => {
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
          data: expect.stringContaining(
            'AwsSolutions-EC2SecurityGroupDescription:'
          ),
        }),
      })
    );
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
  test('combined supressions with addResourceSuppressions and addStackSuppressions', () => {
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
          data: expect.stringContaining(
            'AwsSolutions-EC2SecurityGroupDescription:'
          ),
        }),
      })
    );
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
  test('Stack suppressions work on Nested Stacks', () => {
    const stack = new Stack();
    const nestedStack1 = new NestedStack(stack, 'rNestedStack1');
    const nestedStack2 = new Stack(stack, 'rNestedStack2');
    const suppression = {
      id: 'AwsSolutions-EC23',
      reason: 'lorem ipsum',
    };
    NagSuppressions.addStackSuppressions(stack, [suppression], true);
    const rootMetadata =
      stack.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    const nested1Metadata =
      nestedStack1.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    const nested2Metadata =
      nestedStack2.templateOptions.metadata?.cdk_nag?.rules_to_suppress;
    expect(rootMetadata).toContainEqual(expect.objectContaining(suppression));
    expect(nested1Metadata).toEqual(rootMetadata);
    expect(nested2Metadata).toEqual(rootMetadata);
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
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CdkNagSuppression: AwsSolutions-EC23'),
        }),
      })
    );
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
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CdkNagSuppression: AwsSolutions-EC23'),
        }),
      })
    );
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

describe('Rule exception handling', () => {
  const ERROR_MESSAGE = 'oops!';
  class BadPack extends NagPack {
    constructor(props?: NagPackProps) {
      super(props);
      this.packName = 'Bad.Pack';
    }
    public visit(node: IConstruct): void {
      if (node instanceof CfnResource) {
        this.applyRule({
          ruleSuffixOverride: 'BadRule',
          info: 'This is a imporperly made rule.',
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
  test('Suppressed validation error is logged with suppressed rule logging', () => {
    const stack = new Stack();
    Aspects.of(stack).add(new BadPack({ logIgnores: true }));
    new CfnBucket(stack, 'rBucket').addMetadata('cdk_nag', {
      rules_to_suppress: [
        { id: 'CdkNagValidationFailure', reason: 'at least 10 characters' },
      ],
    });
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CdkNagSuppression: CdkNagValidationFailure'
          ),
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

describe('Report system', () => {
  class TestPack extends NagPack {
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
              if (node2.cfnResourceType !== 'Error') {
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
      const fileName = `${this.packName}-${params.node.stack.stackName}-NagReport.csv`;
      if (!this.reportStacks.includes(fileName)) {
        this.reportStacks.push(fileName);
      }
    }
  }

  test('Reports are generated for all stacks', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const stack2 = new Stack(app, 'Stack2');
    const pack = new TestPack({ reports: true });
    Aspects.of(app).add(pack);
    new SecurityGroup(stack, 'rSg', {
      vpc: new Vpc(stack, 'rVpc'),
    });
    new Bucket(stack2, 'rBucket');
    app.synth();
    expect(pack.readReportStacks.length).toEqual(2);
  });
  test('Compliant and Non-Compliant values are written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new TestPack({ reports: true });
    Aspects.of(app).add(pack);
    new CfnResource(stack, 'rResource', { type: 'foo' });
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error"\n',
      '"Test-Non-Compliant","Stack1/rResource","Non-Compliant","N/A","Error"\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
  test('Suppression values are written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new TestPack({ reports: true });
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
      '"Test-Compliant","Stack1/rResource","Compliant","N/A","Error"\n',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","lorem ipsum","Error"\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
  test('Error values are written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new TestPack({ reports: true });
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
      '"Test-Non-Compliant","Stack1/rResource","UNKNOWN","N/A","Error"\n',
      '"Test-Compliant","Stack1/rResource","UNKNOWN","N/A","Error"\n',
      '"Test-N/A","Stack1/rResource","UNKNOWN","N/A","Error"\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
  test('Suppressed error values are escaped and written properly', () => {
    const app = new App();
    const stack = new Stack(app, 'Stack1');
    const pack = new TestPack({ reports: true });
    Aspects.of(app).add(pack);
    const resource = new CfnResource(stack, 'rResource', { type: 'Error' });
    NagSuppressions.addResourceSuppressions(resource, [
      { id: 'CdkNagValidationFailure', reason: '"quoted "lorem" ipsum"' },
    ]);
    app.synth();
    const expectedOuput = [
      '"Test-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error"\n',
      '"Test-N/A","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error"\n',
      '"Test-Non-Compliant","Stack1/rResource","Suppressed","""quoted ""lorem"" ipsum""","Error"\n',
    ];
    expect(pack.lines.sort()).toEqual(expectedOuput.sort());
  });
});

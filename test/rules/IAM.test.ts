/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  User,
  Group,
  PolicyStatement,
  Policy,
  ManagedPolicy,
  Effect,
  Role,
  AccountRootPrincipal,
  ServicePrincipal,
  CfnUserToGroupAddition,
  PolicyDocument,
} from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  IAMGroupHasUsers,
  IAMNoInlinePolicy,
  IAMNoManagedPolicies,
  IAMNoWildcardPermissions,
  IAMPolicyNoStatementsWithAdminAccess,
  IAMPolicyNoStatementsWithFullAccess,
  IAMUserGroupMembership,
  IAMUserNoPolicies,
} from '../../src/rules/iam';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        IAMGroupHasUsers,
        IAMNoInlinePolicy,
        IAMNoManagedPolicies,
        IAMNoWildcardPermissions,
        IAMPolicyNoStatementsWithAdminAccess,
        IAMPolicyNoStatementsWithFullAccess,
        IAMUserGroupMembership,
        IAMUserNoPolicies,
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('AWS Identity and Access Management Service (AWS IAM)', () => {
  test('IAMGroupHasUsers: IAM Groups have at least one IAM User', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Group(nonCompliant, 'rGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMGroupHasUsers:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Group(compliant, 'rGroup').addUser(new User(compliant, 'rUser'));
    new Group(compliant, 'rGroup2', { groupName: 'foo' });
    new User(compliant, 'rUser2').addToGroup(
      Group.fromGroupArn(
        compliant,
        'rImportedGroup2',
        'arn:aws:iam::123456789012:group/foo'
      )
    );
    new Group(compliant, 'rGroup3', { groupName: 'baz' });
    new CfnUserToGroupAddition(compliant, 'rUserToGroupAddition', {
      groupName: 'baz',
      users: ['bar'],
    });
    new CfnUserToGroupAddition(compliant, 'rUserToGroupAddition2', {
      groupName: new Group(compliant, 'rGroup4').groupName,
      users: ['bar'],
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMGroupHasUsers:'),
        }),
      })
    );
  });

  test('IAMNoInlinePolicy: IAM Groups, Users, and Roles do not contain inline policies', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    const myPolicy = new Policy(nonCompliant, 'rPolicy');
    myPolicy.addStatements(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(nonCompliant, 'rBucket').arnForObjects('*')],
      })
    );
    myPolicy.attachToUser(new User(nonCompliant, 'rUser'));
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoInlinePolicy:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Role(nonCompliant2, 'rUser', {
      assumedBy: new ServicePrincipal('sns.amazonaws.com'),
    }).addToPolicy(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(nonCompliant2, 'rBucket').arnForObjects('*')],
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoInlinePolicy:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const myGroup = new Group(compliant, 'rGroup');
    const myManagedPolicy = new ManagedPolicy(compliant, 'rManagedPolicy');
    myManagedPolicy.addStatements(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(compliant, 'rBucket').arnForObjects('*')],
      })
    );
    myGroup.addManagedPolicy(myManagedPolicy);
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoInlinePolicy:'),
        }),
      })
    );
  });

  test('IAMNoManagedPolicies: IAM users, roles, and groups do not use AWS managed policies', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Role(nonCompliant, 'rRole', {
      assumedBy: new AccountRootPrincipal(),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('foo')],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoManagedPolicies:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Role(compliant, 'rRole', {
      assumedBy: new AccountRootPrincipal(),
      managedPolicies: [
        ManagedPolicy.fromManagedPolicyName(compliant, 'rPolicyWithRef', 'foo'),
        ManagedPolicy.fromManagedPolicyArn(
          compliant,
          'rPolicyWithNumber',
          'arn:aws:iam::123456789012:policy/teststack'
        ),
      ],
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoManagedPolicies:'),
        }),
      })
    );
  });

  test('IAMNoWildcardPermissions: IAM entities with wildcard permissions have a cdk_nag rule suppression with evidence for those permission', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Role(nonCompliant, 'rRole', {
      assumedBy: new AccountRootPrincipal(),
      inlinePolicies: {
        foo: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:PutObject'],
              resources: ['*'],
            }),
          ],
        }),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoWildcardPermissions:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Group(nonCompliant2, 'rGroup').addToPolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: [new Bucket(nonCompliant2, 'rBucket').bucketArn],
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoWildcardPermissions:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const user = new User(compliant, 'rUser');
    user.addToPolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket'],
        resources: [new Bucket(compliant, 'rBucket').bucketArn],
      })
    );
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMNoWildcardPermissions:'),
        }),
      })
    );
  });

  test('IAMPolicyNoStatementsWithAdminAccess: IAM policies do not grant admin access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new ManagedPolicy(nonCompliant, 'rManagedPolicy').addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['*'],
        resources: ['arn*'],
      })
    );
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Group(nonCompliant2, 'rGroup');
    new ManagedPolicy(nonCompliant2, 'rManagedPolicy').addStatements(
      new PolicyStatement({
        actions: ['glacier:DescribeJob'],
        resources: ['*'],
      }),
      new PolicyStatement({
        actions: ['glacier:DescribeJob', '*'],
        resources: ['*'],
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new Role(nonCompliant3, 'rRole', {
      assumedBy: new AccountRootPrincipal(),
    }).addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['*'],
        actions: ['glacier:DescribeJob', '*'],
      })
    );
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new Role(nonCompliant4, 'rRole', {
      assumedBy: new AccountRootPrincipal(),
    }).addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['arn:aws:s3:::examplebucket', '*'],
        actions: ['s3:CreateBucket', '*'],
      })
    );
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new ManagedPolicy(compliant, 'rManagedPolicy').addStatements(
      new PolicyStatement({
        actions: ['glacier:DescribeJob'],
        resources: ['*'],
      }),
      new PolicyStatement({
        actions: ['glacier:*'],
        resources: ['*'],
      }),
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['arn:aws:s3:::examplebucket1/*'],
      })
    );
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );
  });

  test('IAMPolicyNoStatementsWithFullAccess: IAM policies do not grant full access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new ManagedPolicy(nonCompliant, 'rManagedPolicy').addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['*'],
        resources: ['arn*'],
      })
    );
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMPolicyNoStatementsWithFullAccess:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Group(nonCompliant2, 'rGroup');
    new ManagedPolicy(nonCompliant2, 'rManagedPolicy').addStatements(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['arn:aws:s3:::awsexamplebucket1'],
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMPolicyNoStatementsWithFullAccess:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new Role(nonCompliant3, 'rRole', {
      assumedBy: new AccountRootPrincipal(),
    }).addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['arn:aws:s3:::awsexamplebucket1'],
        actions: ['s3:GetBucketAcl', '*'],
      })
    );
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMPolicyNoStatementsWithFullAccess:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new Role(nonCompliant4, 'rRole', {
      assumedBy: new AccountRootPrincipal(),
    }).addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['arn:aws:s3:::awsexamplebucket1'],
        actions: ['s3:GetBucketAcl', 's3:*'],
      })
    );
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMPolicyNoStatementsWithFullAccess:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new ManagedPolicy(compliant, 'rManagedPolicy').addStatements(
      new PolicyStatement({
        actions: ['glacier:DescribeJob'],
        resources: ['*'],
      }),
      new PolicyStatement({
        actions: ['s3:ListAllMyBuckets'],
        resources: ['arn:aws:s3:::*'],
      }),
      new PolicyStatement({
        actions: ['s3:ListAllMyBuckets'],
        resources: ['*'],
      })
    );
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMPolicyNoStatementsWithFullAccess:'),
        }),
      })
    );
  });

  test('IAMUserGroupMembership: IAM users are assigned to at least one group', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new User(nonCompliant, 'rUser');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMUserGroupMembership:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Group(compliant, 'rGroup').addUser(new User(compliant, 'rUser'));
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMUserGroupMembership:'),
        }),
      })
    );
  });

  test('IAMUserNoPolicies: IAM policies are not attached at the user level', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Policy(nonCompliant, 'rPolicy', {
      users: [new User(nonCompliant, 'rUser')],
    }).addStatements(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(nonCompliant, 'rBucket').arnForObjects('*')],
      })
    );
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMUserNoPolicies:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new User(nonCompliant2, 'rUser', {
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess'),
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMUserNoPolicies:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const myGroup = new Group(compliant, 'rGroup');
    myGroup.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess')
    );
    myGroup.addUser(new User(compliant, 'rUser'));
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('IAMUserNoPolicies:'),
        }),
      })
    );
  });
});

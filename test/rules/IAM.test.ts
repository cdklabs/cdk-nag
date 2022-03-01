/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
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
import { Aspects, Stack } from '@aws-cdk/core';
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
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  IAMGroupHasUsers,
  IAMNoInlinePolicy,
  IAMNoManagedPolicies,
  IAMNoWildcardPermissions,
  IAMPolicyNoStatementsWithAdminAccess,
  IAMPolicyNoStatementsWithFullAccess,
  IAMUserGroupMembership,
  IAMUserNoPolicies,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Identity and Access Management Service (AWS IAM)', () => {
  describe('IAMGroupHasUsers: IAM Groups have at least one IAM User', () => {
    const ruleId = 'IAMGroupHasUsers';
    test('Noncompliance 1', () => {
      new Group(stack, 'rGroup');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Group(stack, 'rGroup').addUser(new User(stack, 'rUser'));
      new Group(stack, 'rGroup2', { groupName: 'foo' });
      new User(stack, 'rUser2').addToGroup(
        Group.fromGroupArn(
          stack,
          'rImportedGroup2',
          'arn:aws:iam::123456789012:group/foo'
        )
      );
      new Group(stack, 'rGroup3', { groupName: 'baz' });
      new CfnUserToGroupAddition(stack, 'rUserToGroupAddition', {
        groupName: 'baz',
        users: ['bar'],
      });
      new CfnUserToGroupAddition(stack, 'rUserToGroupAddition2', {
        groupName: new Group(stack, 'rGroup4').groupName,
        users: ['bar'],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('IAMNoInlinePolicy: IAM Groups, Users, and Roles do not contain inline policies', () => {
    const ruleId = 'IAMNoInlinePolicy';
    test('Noncompliance 1', () => {
      const myPolicy = new Policy(stack, 'rPolicy');
      myPolicy.addStatements(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(stack, 'rBucket').arnForObjects('*')],
        })
      );
      myPolicy.attachToUser(new User(stack, 'rUser'));
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Role(stack, 'rUser', {
        assumedBy: new ServicePrincipal('sns.amazonaws.com'),
      }).addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(stack, 'rBucket').arnForObjects('*')],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const myGroup = new Group(stack, 'rGroup');
      const myManagedPolicy = new ManagedPolicy(stack, 'rManagedPolicy');
      myManagedPolicy.addStatements(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(stack, 'rBucket').arnForObjects('*')],
        })
      );
      myGroup.addManagedPolicy(myManagedPolicy);
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('IAMNoManagedPolicies: IAM users, roles, and groups do not use AWS managed policies', () => {
    const ruleId = 'IAMNoManagedPolicies';
    test('Noncompliance 1', () => {
      new Role(stack, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
        managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('foo')],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Role(stack, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
        managedPolicies: [
          ManagedPolicy.fromManagedPolicyName(stack, 'rPolicyWithRef', 'foo'),
          ManagedPolicy.fromManagedPolicyArn(
            stack,
            'rPolicyWithNumber',
            'arn:aws:iam::123456789012:policy/describestack'
          ),
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('IAMNoWildcardPermissions: IAM entities with wildcard permissions have a cdk_nag rule suppression with evidence for those permission', () => {
    const ruleId = 'IAMNoWildcardPermissions';
    test('Noncompliance 1', () => {
      new Role(stack, 'rRole', {
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
      validateStack(stack, `${ruleId}[Resource::*]`, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Group(stack, 'rGroup').addToPolicy(
        new PolicyStatement({
          actions: ['s3:*'],
          resources: [new Bucket(stack, 'rBucket').bucketArn],
        })
      );
      validateStack(stack, `${ruleId}[Action::s3:*]`, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 3', () => {
      new Role(stack, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
        inlinePolicies: {
          foo: new PolicyDocument({
            statements: [
              new PolicyStatement({
                actions: ['s3:PutObject'],
                resources: [
                  stack.formatArn({
                    service: 's3',
                    resource: 'myBucket',
                    resourceName: '*',
                  }),
                ],
              }),
            ],
          }),
        },
      });
      validateStack(
        stack,
        `${ruleId}[Resource::arn:<AWS::Partition>:s3:<AWS::Region>:<AWS::AccountId>:myBucket/*]`,
        TestType.NON_COMPLIANCE
      );
    });

    test('Compliance', () => {
      const user = new User(stack, 'rUser');
      user.addToPolicy(
        new PolicyStatement({
          actions: ['s3:ListBucket'],
          resources: [new Bucket(stack, 'rBucket').bucketArn],
        })
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('IAMPolicyNoStatementsWithAdminAccess: IAM policies do not grant admin access', () => {
    const ruleId = 'IAMPolicyNoStatementsWithAdminAccess';
    test('Noncompliance 1', () => {
      new ManagedPolicy(stack, 'rManagedPolicy').addStatements(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['*'],
          resources: ['arn*'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Group(stack, 'rGroup');
      new ManagedPolicy(stack, 'rManagedPolicy').addStatements(
        new PolicyStatement({
          actions: ['glacier:DescribeJob'],
          resources: ['*'],
        }),
        new PolicyStatement({
          actions: ['glacier:DescribeJob', '*'],
          resources: ['*'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new Role(stack, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
      }).addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['*'],
          actions: ['glacier:DescribeJob', '*'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new Role(stack, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
      }).addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['arn:aws:s3:::examplebucket', '*'],
          actions: ['s3:CreateBucket', '*'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new ManagedPolicy(stack, 'rManagedPolicy').addStatements(
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('IAMPolicyNoStatementsWithFullAccess: IAM policies do not grant full access', () => {
    const ruleId = 'IAMPolicyNoStatementsWithFullAccess';
    test('Noncompliance 1', () => {
      new ManagedPolicy(stack, 'rManagedPolicy').addStatements(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['*'],
          resources: ['arn*'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Group(stack, 'rGroup');
      new ManagedPolicy(stack, 'rManagedPolicy').addStatements(
        new PolicyStatement({
          actions: ['s3:*'],
          resources: ['arn:aws:s3:::awsexamplebucket1'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new Role(stack, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
      }).addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['arn:aws:s3:::awsexamplebucket1'],
          actions: ['s3:GetBucketAcl', '*'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new Role(stack, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
      }).addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['arn:aws:s3:::awsexamplebucket1'],
          actions: ['s3:GetBucketAcl', 's3:*'],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new ManagedPolicy(stack, 'rManagedPolicy').addStatements(
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('IAMUserGroupMembership: IAM users are assigned to at least one group', () => {
    const ruleId = 'IAMUserGroupMembership';
    test('Noncompliance 1', () => {
      new User(stack, 'rUser');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Group(stack, 'rGroup').addUser(new User(stack, 'rUser'));
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('IAMUserNoPolicies: IAM policies are not attached at the user level', () => {
    const ruleId = 'IAMUserNoPolicies';
    test('Noncompliance 1', () => {
      new Policy(stack, 'rPolicy', {
        users: [new User(stack, 'rUser')],
      }).addStatements(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(stack, 'rBucket').arnForObjects('*')],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new User(stack, 'rUser', {
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess'),
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const myGroup = new Group(stack, 'rGroup');
      myGroup.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess')
      );
      myGroup.addUser(new User(stack, 'rUser'));
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

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
  CfnUserToGroupAddition,
} from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon Identity and Access Management Service (AWS IAM)', () => {
  test('NIST.800.53.R4-IAMGroupHasUsers: - IAM Groups have at least one IAM User - (Control ID: AC-2(j))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new Group(nonCompliant, 'rGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMGroupHasUsers:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-IAMGroupHasUsers:'),
        }),
      })
    );
  });
  test('NIST.800.53.R4-IAMGroupMembership: IAM users are assigned to at least one group', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());

    const user = new User(nonCompliant, 'rUser');

    user.stack;

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMGroupMembership:'),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R4Checks());

    const user2 = new User(activeCompliant, 'rUser');
    new Group(activeCompliant, 'rGroup').addUser(user2);

    const messages2 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMGroupMembership:'),
        }),
      })
    );

    const passiveCompliant = new Stack();
    Aspects.of(passiveCompliant).add(new NIST80053R4Checks());

    const myGroup = new Group(passiveCompliant, 'rGroup');
    myGroup.addToPolicy(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(passiveCompliant, 'rBucket').arnForObjects('*')],
      })
    );

    const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMGroupMembership:'),
        }),
      })
    );
  });

  test('NIST.800.53.R4-IAMUserNoPolicies: IAM policies are not attached at the user level', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    const user = new User(nonCompliant, 'rUser');
    new Group(nonCompliant, 'rGroup').addUser(user);
    const myPolicy = new Policy(nonCompliant, 'rPolicy', { users: [user] });
    myPolicy.addStatements(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(nonCompliant, 'rBucket').arnForObjects('*')],
      })
    );
    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMUserNoPolicies:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
    new User(nonCompliant2, 'rUser', {
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess'),
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMUserNoPolicies:'),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R4Checks());
    const myGroup = new Group(activeCompliant, 'rGroup');
    myGroup.addToPolicy(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(activeCompliant, 'rBucket').arnForObjects('*')],
      })
    );
    new User(activeCompliant, 'rUser');
    const messages3 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMUserNoPolicies:'),
        }),
      })
    );
  });

  test('NIST.800.53.R4-IAMNoInlinePolicy: There are no inline IAM policies, only managed', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());

    const myPolicy = new Policy(nonCompliant, 'rPolicy');

    myPolicy.addStatements(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(nonCompliant, 'rBucket').arnForObjects('*')],
      })
    );

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMNoInlinePolicy:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());

    new Group(nonCompliant2, 'rGroup').addToPolicy(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [new Bucket(nonCompliant2, 'rBucket').arnForObjects('*')],
      })
    );

    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMNoInlinePolicy:'),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R4Checks());

    const group = new Group(activeCompliant, 'MyGroup');
    group.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess')
    );

    const messages3 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-IAMNoInlinePolicy:'),
        }),
      })
    );
  });

  test('NIST.800.53.R4-IAMPolicyNoStatementsWithAdminAccess: There are no IAM policies within the deployment that give admin-level access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());

    const myNCPolicy = new ManagedPolicy(nonCompliant, 'rManagedPolicy');

    myNCPolicy.document.addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['*'],
        resources: ['arn*'],
      })
    );

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());

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
            'NIST.800.53.R4-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R4Checks());

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
            'NIST.800.53.R4-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R4Checks());

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
            'NIST.800.53.R4-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R4Checks());

    new ManagedPolicy(activeCompliant, 'rManagedPolicy').addStatements(
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
    const messages5 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );
  });
});

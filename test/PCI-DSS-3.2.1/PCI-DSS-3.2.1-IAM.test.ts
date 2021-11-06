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
} from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon Identity and Access Management Service (AWS IAM)', () => {
  test('PCI.DSS.321-IAMGroupHasUsers: - IAM Groups have at least one IAM User - (Control IDs: 7.1.2, 7.1.3, 7.2.1, 7.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Group(nonCompliant, 'rGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-IAMGroupHasUsers:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-IAMGroupHasUsers:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-IAMNoInlinePolicy: - IAM Groups, Users, and Roles do not contain inline policies - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-IAMNoInlinePolicy:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-IAMNoInlinePolicy:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-IAMNoInlinePolicy:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-IAMPolicyNoStatementsWithAdminAccess: - IAM policies do not grant admin access - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-IAMPolicyNoStatementsWithAdminAccess:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-IAMPolicyNoStatementsWithFullAccess: - IAM policies do not grant full access - (Control IDs: 7.1.2, 7.1.3, 7.2.1, 7.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-IAMPolicyNoStatementsWithFullAccess:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining(
            'PCI.DSS.321-IAMPolicyNoStatementsWithFullAccess:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
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
          data: expect.stringContaining(
            'PCI.DSS.321-IAMPolicyNoStatementsWithFullAccess:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
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
          data: expect.stringContaining(
            'PCI.DSS.321-IAMPolicyNoStatementsWithFullAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining(
            'PCI.DSS.321-IAMPolicyNoStatementsWithFullAccess:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-IAMUserGroupMembership: - IAM users are assigned to at least one group - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new User(nonCompliant, 'rUser');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-IAMUserGroupMembership:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new Group(compliant, 'rGroup').addUser(new User(compliant, 'rUser'));
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-IAMUserGroupMembership:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-IAMUserNoPolicies: - IAM policies are not attached at the user level - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-IAMUserNoPolicies:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new User(nonCompliant2, 'rUser', {
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess'),
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-IAMUserNoPolicies:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    const myGroup = new Group(compliant, 'rGroup');
    myGroup.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess')
    );
    myGroup.addUser(new User(compliant, 'rUser'));
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-IAMUserNoPolicies:'),
        }),
      })
    );
  });
});

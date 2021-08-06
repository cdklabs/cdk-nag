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
} from '@aws-cdk/aws-iam';

import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 Compliance Checks', () => {
  describe('Amazon Identity and Access Management Service (AWS IAM)', () => {
    test('NIST.800.53-IAMGroupMembershipCheck: IAM users are assigned to at least one group', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const user = new User(nonCompliant, 'rUser');

      user.stack;

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMGroupMembershipCheck:'
            ),
          }),
        })
      );

      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      const user2 = new User(activeCompliant, 'rUser');
      new Group(activeCompliant, 'rGroup').addUser(user2);

      const messages2 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMGroupMembershipCheck:'
            ),
          }),
        })
      );

      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      const myGroup = new Group(passiveCompliant, 'rGroup');
      myGroup.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [
            new Bucket(passiveCompliant, 'rBucket').arnForObjects('*'),
          ],
        })
      );

      const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMGroupMembershipCheck:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-IAMUserNoPoliciesCheck: IAM policies are not attached at the user level', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const user = new User(nonCompliant, 'rUser');
      new Group(nonCompliant, 'rGroup').addUser(user);

      const myPolicy = new Policy(nonCompliant, 'rPolicy');

      myPolicy.addStatements(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(nonCompliant, 'rBucket').arnForObjects('*')],
        })
      );

      myPolicy.attachToUser(user);

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMUserNoPoliciesCheck:'
            ),
          }),
        })
      );

      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new NIST80053Checks());

      const user3 = new User(nonCompliant2, 'rUser');
      new Group(nonCompliant2, 'rGroup').addUser(user3);

      user3.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(nonCompliant2, 'rBucket').arnForObjects('*')],
        })
      );

      const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMUserNoPoliciesCheck:'
            ),
          }),
        })
      );

      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      const myGroup = new Group(activeCompliant, 'rGroup');
      myGroup.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [
            new Bucket(activeCompliant, 'rBucket').arnForObjects('*'),
          ],
        })
      );

      const user2 = new User(activeCompliant, 'rUser');
      myGroup.addUser(user2);

      const messages3 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMUserNoPoliciesCheck:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-IAMNoInlinePolicyCheck: There are no inline IAM policies, only managed', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

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
            data: expect.stringContaining(
              'NIST.800.53-IAMNoInlinePolicyCheck:'
            ),
          }),
        })
      );

      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new NIST80053Checks());

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
            data: expect.stringContaining(
              'NIST.800.53-IAMNoInlinePolicyCheck:'
            ),
          }),
        })
      );

      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      const group = new Group(activeCompliant, 'MyGroup');
      group.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess')
      );

      const messages3 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMNoInlinePolicyCheck:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-IAMPolicyNoStatementsWithAdminAccess: There are no IAM policies within the deployment that give admin-level access', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

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
              'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'
            ),
          }),
        })
      );

      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new NIST80053Checks());

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
              'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'
            ),
          }),
        })
      );

      const nonCompliant3 = new Stack();
      Aspects.of(nonCompliant3).add(new NIST80053Checks());

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
              'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'
            ),
          }),
        })
      );

      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      new ManagedPolicy(activeCompliant, 'rManagedPolicy').addStatements(
        new PolicyStatement({
          actions: ['glacier:DescribeJob'],
          resources: ['*'],
        })
      );

      const messages4 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'
            ),
          }),
        })
      );
    });
  });
});

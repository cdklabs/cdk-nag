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

      //AC 1: Given a CDK stack with one or more non-compliant IAM users
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant user for AC-2(1) NIST standard
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const user = new User(nonCompliant, 'rUser');

      user.stack;

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMGroupMembershipCheck:'),
          }),
        }),
      );

      //AC 2:
      //Given a CDK stack with compliant IAM user(s):
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for AC-2(1) NIST standard
      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      const user2 = new User(activeCompliant, 'rUser');
      new Group(activeCompliant, 'rGroup').addUser(user2);

      const messages2 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMGroupMembershipCheck:'),
          }),
        }),
      );

      //AC 3:
      //Given a CDK stack with no IAM users:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about AC-2(1) NIST standard
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      const myGroup = new Group(passiveCompliant, 'rGroup');
      myGroup.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(passiveCompliant, 'rBucket').arnForObjects('*')],
        }),
      );

      const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMGroupMembershipCheck:'),
          }),
        }),
      );

    });

    test('NIST.800.53-IAMUserNoPoliciesCheck: IAM policies are not attached at the user level', () => {

      //AC 1: Given a CDK stack with one or more non-compliant IAM users
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant user for the relevant NIST standard
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const user = new User(nonCompliant, 'rUser');
      new Group(nonCompliant, 'rGroup').addUser(user);

      const myPolicy = new Policy(nonCompliant, 'rPolicy');

      myPolicy.addStatements(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(nonCompliant, 'rBucket').arnForObjects('*')],
        }),
      );

      myPolicy.attachToUser(user);

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMUserNoPoliciesCheck:'),
          }),
        }),
      );


      //testing that check also catches non compliance when using .addToPolicy on a user directly
      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new NIST80053Checks());

      const user3 = new User(nonCompliant2, 'rUser');
      new Group(nonCompliant2, 'rGroup').addUser(user3);

      user3.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(nonCompliant2, 'rBucket').arnForObjects('*')],
        }),
      );

      const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMUserNoPoliciesCheck:'),
          }),
        }),
      );

      //AC 2:
      //Given a CDK stack with compliant IAM user(s):
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for relevant NIST standard
      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      const myGroup = new Group(activeCompliant, 'rGroup');
      myGroup.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(activeCompliant, 'rBucket').arnForObjects('*')],
        }),
      );

      const user2 = new User(activeCompliant, 'rUser');
      myGroup.addUser(user2);

      const messages3 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMUserNoPoliciesCheck:'),
          }),
        }),
      );

      //AC 3:
      //Given a CDK stack with no IAM users:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the relevant NIST standard
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      const myGroup2 = new Group(passiveCompliant, 'rGroup');
      myGroup2.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(passiveCompliant, 'rBucket').arnForObjects('*')],
        }),
      );

      const messages4 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMUserNoPoliciesCheck:'),
          }),
        }),
      );

    });

    test('NIST.800.53-IAMNoInlinePolicyCheck: There are no inline IAM policies, only managed', () => {

      //AC 1: Given a CDK stack with one or more non-compliant IAM users
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant user for the relevant NIST standard
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const myPolicy = new Policy(nonCompliant, 'rPolicy');

      myPolicy.addStatements(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(nonCompliant, 'rBucket').arnForObjects('*')],
        }),
      );

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMNoInlinePolicyCheck:'),
          }),
        }),
      );


      //testing that check also catches non compliance when using .addToPolicy to create an inline policy
      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new NIST80053Checks());

      new Group(nonCompliant2, 'rGroup').addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(nonCompliant2, 'rBucket').arnForObjects('*')],
        }),
      );

      const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMNoInlinePolicyCheck:'),
          }),
        }),
      );

      //AC 2:
      //Given a CDK stack with compliant IAM user(s):
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for relevant NIST standard
      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      const group = new Group(activeCompliant, 'MyGroup');
      group.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess'));

      const messages3 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMNoInlinePolicyCheck:'),
          }),
        }),
      );

      //AC 3:
      //Given a CDK stack with no IAM users:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the relevant NIST standard
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      const user1 = new User(passiveCompliant, 'rUser');
      const myGroup2 = new Group(passiveCompliant, 'rGroup');

      user1.addToGroup(myGroup2);

      const messages4 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMNoInlinePolicyCheck:'),
          }),
        }),
      );

    });

    test('NIST.800.53-IAMPolicyNoStatementsWithAdminAccess: There are no IAM policies within the deployment that give admin-level access', () => {

      //AC 1: Given a CDK stack with one or more non-compliant IAM users
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant user for the relevant NIST standard
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const myNCPolicy = new ManagedPolicy(nonCompliant, 'rManagedPolicy');

      myNCPolicy.document.addStatements(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['*'],
          resources: ['arn*'],
        }),
      );

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'),
          }),
        }),
      );

      //testing that check also catches non compliance when there are multiple statements and * is in the actions field as an array
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
        }),
      );

      const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'),
          }),
        }),
      );

      //testing that check also catches non compliance when the policy is defined as inline and * is in the actions field as an array
      const nonCompliant3 = new Stack();
      Aspects.of(nonCompliant3).add(new NIST80053Checks());


      new Role(nonCompliant3, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
      }).addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['*'],
          actions: ['glacier:DescribeJob', '*'],
        }),
      );

      const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'),
          }),
        }),
      );


      //AC 2:
      //Given a CDK stack with compliant IAM policies:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for relevant NIST standard
      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

      new ManagedPolicy(activeCompliant, 'rManagedPolicy').addStatements(
        new PolicyStatement({
          actions: ['glacier:DescribeJob'],
          resources: ['*'],
        }),
      );

      const messages4 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'),
          }),
        }),
      );

      //AC 3:
      //Given a CDK stack with no IAM policies:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the relevant NIST standard
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      const user1 = new User(passiveCompliant, 'rUser');
      const myGroup2 = new Group(passiveCompliant, 'rGroup');

      user1.addToGroup(myGroup2);

      const messages5 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages5).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-IAMPolicyNoStatementsWithAdminAccess:'),
          }),
        }),
      );

    });

  });
});

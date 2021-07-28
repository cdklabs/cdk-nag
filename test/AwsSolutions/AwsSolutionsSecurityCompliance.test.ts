/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  UserPool,
  CfnUserPool,
  CfnIdentityPool,
  Mfa,
} from '@aws-cdk/aws-cognito';
import {
  Role,
  ManagedPolicy,
  AccountRootPrincipal,
  PolicyDocument,
  PolicyStatement,
  User,
  Group,
} from '@aws-cdk/aws-iam';
import { Key, KeySpec } from '@aws-cdk/aws-kms';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, CfnResource, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Solutions Security and Compliance Checks', () => {
  describe('AWS Identity and Access Management (IAM)', () => {
    test('awsSolutionsIam4: IAM users, roles, and groups do not use AWS managed policies', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Role(positive, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
        managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('foo')],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-IAM4:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Role(negative, 'rRole', {
        assumedBy: new AccountRootPrincipal(),
        managedPolicies: [
          ManagedPolicy.fromManagedPolicyName(
            negative,
            'rPolicyWithRef',
            'foo'
          ),
          ManagedPolicy.fromManagedPolicyArn(
            negative,
            'rPolicyWithNumber',
            'arn:aws:iam::123456789012:policy/teststack'
          ),
        ],
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-IAM4:'),
          }),
        })
      );
    });
    test('awsSolutionsIam5: IAM entities with wildcard permissions have a cdk_nag rule suppression with evidence for those permission', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Role(positive, 'rRole', {
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
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-IAM5:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Group(positive2, 'rGroup').addToPolicy(
        new PolicyStatement({
          actions: ['s3:*'],
          resources: [new Bucket(positive2, 'rBucket').bucketArn],
        })
      );
      const messages2 = SynthUtils.synthesize(positive).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-IAM5:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const user = new User(negative, 'rUser');
      user.addToPolicy(
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [new Bucket(negative, 'rBucket').arnForObjects('*')],
        })
      );
      const cfnUser = user.node.children;
      for (const child of cfnUser) {
        const resource = child.node.defaultChild as CfnResource;
        if (
          resource != undefined &&
          resource.cfnResourceType == 'AWS::IAM::Policy'
        ) {
          resource.addMetadata('cdk_nag', {
            rules_to_suppress: [
              {
                id: 'AwsSolutions-IAM5',
                reason:
                  'The user is allowed to put objects on all prefixes in the specified bucket.',
              },
            ],
          });
        }
      }
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-IAM5:'),
          }),
        })
      );
    });
  });

  describe('Amazon Cognito', () => {
    test('awsSolutionsCog1: Cognito user pools have password policies that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters ', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new UserPool(positive, 'rUserPool');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG1:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new UserPool(positive2, 'rUserPool', {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireDigits: true,
        },
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new UserPool(negative, 'rUserPool', {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireDigits: true,
          requireSymbols: true,
        },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG1:'),
          }),
        })
      );
    });
    test('awsSolutionsCog2: Cognito user pools require MFA', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new UserPool(positive, 'rUserPool');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG2:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new UserPool(positive2, 'rUserPool', { mfa: Mfa.OPTIONAL });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new UserPool(negative, 'rUserPool', { mfa: Mfa.REQUIRED });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG2:'),
          }),
        })
      );
    });
    test('awsSolutionsCog3: Cognito user pools have AdvancedSecurityMode set to ENFORCED', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new UserPool(positive, 'rUserPool');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG3:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnUserPool(positive2, 'rUserPool', {
        userPoolAddOns: { advancedSecurityMode: 'OFF' },
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnUserPool(negative, 'rUserPool', {
        userPoolAddOns: { advancedSecurityMode: 'ENFORCED' },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG3:'),
          }),
        })
      );
    });
    test('awsSolutionsCog7: Cognito identity pools do not allow for unauthenticated logins without a valid reason', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnIdentityPool(positive, 'rIdentityPool', {
        allowUnauthenticatedIdentities: true,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG7:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnIdentityPool(negative, 'rIdentityPool', {
        allowUnauthenticatedIdentities: false,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-COG7:'),
          }),
        })
      );
    });
  });

  describe('AWS Key Management Service (KMS)', () => {
    test('awsSolutionsKms5: KMS Symmetric CMKs have Key Rotation enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Key(positive, 'rSymmetricKey');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KMS5:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Key(negative, 'rSymmetricKey', { enableKeyRotation: true });
      new Key(negative, 'rAsymmetricKey', { keySpec: KeySpec.RSA_4096 });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KMS5:'),
          }),
        })
      );
    });
  });
});

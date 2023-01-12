/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Key } from 'aws-cdk-lib/aws-kms';
import { Function } from 'aws-cdk-lib/aws-lambda';
import {
  Secret,
  CfnSecret,
  HostedRotation,
  CfnRotationSchedule,
  CfnSecretTargetAttachment,
} from 'aws-cdk-lib/aws-secretsmanager';
import { Aspects, Stack, Duration } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  SecretsManagerRotationEnabled,
  SecretsManagerUsingKMSKey,
} from '../../src/rules/secretsmanager';

const testPack = new TestPack([
  SecretsManagerRotationEnabled,
  SecretsManagerUsingKMSKey,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Secrets Manager', () => {
  describe('SecretsManagerRotationEnabled: Secrets have automatic rotation scheduled', () => {
    const ruleId = 'SecretsManagerRotationEnabled';
    test('Noncompliance 1', () => {
      new Secret(stack, 'rSecret1');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnRotationSchedule(stack, 'rRotationSchedule', {
        secretId: new CfnSecretTargetAttachment(stack, 'rCfnTargetAttachment', {
          secretId: new Secret(stack, 'rSecret').secretArn,
          targetId: 'foo',
          targetType: 'bar',
        }).ref,
        hostedRotationLambda: { rotationType: 'baz' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnRotationSchedule(stack, 'rRotationSchedule', {
        secretId: new CfnSecretTargetAttachment(stack, 'rCfnTargetAttachment', {
          secretId: new Secret(stack, 'rSecret').secretArn,
          targetId: 'foo',
          targetType: 'bar',
        }).ref,
        rotationRules: {
          automaticallyAfterDays: 42,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Secret(stack, 'rSecret1').addRotationSchedule('rRotationSchedule1', {
        hostedRotation: HostedRotation.mysqlSingleUser(),
      });
      new Secret(stack, 'rSecret2').addRotationSchedule('rRotationSchedule2', {
        rotationLambda: Function.fromFunctionArn(
          stack,
          'rLambda',
          'arn:aws:lambda:us-east-1:111222333444:function:helloworld'
        ),
        automaticallyAfter: Duration.days(30),
      });
      new CfnRotationSchedule(stack, 'rRotationSchedule3', {
        secretId: new CfnSecretTargetAttachment(stack, 'rCfnTargetAttachment', {
          secretId: new Secret(stack, 'rSecret3').secretArn,
          targetId: 'foo',
          targetType: 'bar',
        }).ref,
        rotationLambdaArn: 'baz',
        rotationRules: {
          automaticallyAfterDays: 42,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SecretsManagerUsingKMSKey: Secrets are encrypted with KMS Customer managed keys', () => {
    const ruleId = 'SecretsManagerUsingKMSKey';
    test('Noncompliance 1', () => {
      new Secret(stack, 'rSecret');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnSecret(stack, 'rSecret', {
        kmsKeyId: 'aws/secretsmanager',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Secret(stack, 'rSecret', {
        encryptionKey: new Key(stack, 'rKey'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

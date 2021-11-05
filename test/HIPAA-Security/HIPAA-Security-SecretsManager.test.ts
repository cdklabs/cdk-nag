/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { Function } from '@aws-cdk/aws-lambda';
import { Secret, CfnSecret, HostedRotation } from '@aws-cdk/aws-secretsmanager';
import { Aspects, Duration, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('AWS Secrets Manager', () => {
  test('HIPAA.Security-SecretsManagerRotationEnabled: - Secrets have automatic rotation scheduled - (Control ID: 164.308(a)(4)(ii)(B))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Secret(nonCompliant, 'rSecret1');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-SecretsManagerRotationEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Secret(compliant, 'rSecret1').addRotationSchedule(
      'rRotationSchedule1',
      { hostedRotation: HostedRotation.mysqlSingleUser() }
    );
    new Secret(compliant, 'rSecret2').addRotationSchedule(
      'rRotationSchedule2',
      {
        rotationLambda: Function.fromFunctionArn(compliant, 'rLambda', 'foo'),
        automaticallyAfter: Duration.days(30),
      }
    );
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-SecretsManagerRotationEnabled:'
          ),
        }),
      })
    );
  });
  test('HIPAA.Security-SecretsManagerUsingKMSKey: - Secrets are encrypted with KMS Customer managed keys - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Secret(nonCompliant, 'rSecret');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnSecret(nonCompliant2, 'rSecret', {
      kmsKeyId: 'aws/secretsmanager',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Secret(compliant, 'rSecret', {
      encryptionKey: new Key(compliant, 'rKey'),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
  });
});

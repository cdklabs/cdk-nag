/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { Function } from '@aws-cdk/aws-lambda';
import { Secret, CfnSecret, HostedRotation } from '@aws-cdk/aws-secretsmanager';
import { Aspects, Duration, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('AWS Secrets Manager', () => {
  test('NIST.800.53.R5-SecretsManagerRotationEnabled: - Secrets have automatic rotation scheduled - (Control IDs: AC-4, AC-4(22), AC-24(1), AU-9(3), CA-9b, PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1c.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Secret(nonCompliant, 'rSecret1');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SecretsManagerRotationEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-SecretsManagerRotationEnabled:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53.R5-SecretsManagerUsingKMSKey: - Secrets are encrypted with KMS Customer managed keys - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Secret(nonCompliant, 'rSecret');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnSecret(nonCompliant2, 'rSecret', {
      kmsKeyId: 'aws/secretsmanager',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Secret(compliant, 'rSecret', {
      encryptionKey: new Key(compliant, 'rKey'),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
  });
});

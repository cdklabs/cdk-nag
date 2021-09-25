/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { Secret, CfnSecret } from '@aws-cdk/aws-secretsmanager';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('AWS Secrets Manager', () => {
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

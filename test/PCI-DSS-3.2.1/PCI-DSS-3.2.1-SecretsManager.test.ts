/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { Secret, CfnSecret } from '@aws-cdk/aws-secretsmanager';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('AWS Secrets Manager', () => {
  test('PCI.DSS.321-SecretsManagerUsingKMSKey: - Secrets are encrypted with KMS Customer managed keys - (Control IDs: 3.4, 8.2.1, 10.5)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Secret(nonCompliant, 'rSecret');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new CfnSecret(nonCompliant2, 'rSecret', {
      kmsKeyId: 'aws/secretsmanager',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new Secret(compliant, 'rSecret', {
      encryptionKey: new Key(compliant, 'rKey'),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-SecretsManagerUsingKMSKey:'
          ),
        }),
      })
    );
  });
});

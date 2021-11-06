/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key, KeySpec } from '@aws-cdk/aws-kms';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('AWS Key Management Service (KMS)', () => {
  test('NIST.800.53.R5-KMSBackingKeyRotationEnabled: - KMS Symmetric keys have automatic key rotation enabled - (Control IDs: CM-6a, CM-9b, SA-9(6), SC-12, SC-12(2), SC-12(6))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Key(nonCompliant, 'rSymmetricKey');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-KMSBackingKeyRotationEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Key(compliant, 'rSymmetricKey', { enableKeyRotation: true });
    new Key(compliant, 'rAsymmetricKey', { keySpec: KeySpec.RSA_4096 });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-KMSBackingKeyRotationEnabled:'
          ),
        }),
      })
    );
  });
});

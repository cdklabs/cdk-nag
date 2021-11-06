/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key, KeySpec } from '@aws-cdk/aws-kms';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('AWS Key Management Service (KMS)', () => {
  test('PCI.DSS.321-KMSBackingKeyRotationEnabled: - KMS Symmetric keys have key rotation enabled - (Control IDs: 2.2, 3.5, 3.6, 3.6.4)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Key(nonCompliant, 'rSymmetricKey');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-KMSBackingKeyRotationEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new Key(compliant, 'rSymmetricKey', { enableKeyRotation: true });
    new Key(compliant, 'rAsymmetricKey', { keySpec: KeySpec.RSA_4096 });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-KMSBackingKeyRotationEnabled:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Key, KeySpec } from 'aws-cdk-lib/aws-kms';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import { KMSBackingKeyRotationEnabled } from '../../src/rules/kms';

const testPack = new TestPack([KMSBackingKeyRotationEnabled]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Key Management Service (KMS)', () => {
  describe('KMSBackingKeyRotationEnabled: KMS Symmetric keys have automatic key rotation enabled', () => {
    const ruleId = 'KMSBackingKeyRotationEnabled';
    test('Noncompliance 1', () => {
      new Key(stack, 'rSymmetricKey');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Key(stack, 'rSymmetricKey', { enableKeyRotation: true });
      new Key(stack, 'rAsymmetricKey', { keySpec: KeySpec.RSA_4096 });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

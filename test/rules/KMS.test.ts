/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key, KeySpec } from '@aws-cdk/aws-kms';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { KMSBackingKeyRotationEnabled } from '../../src/rules/kms';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [KMSBackingKeyRotationEnabled];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('AWS Key Management Service (KMS)', () => {
  test('KMSBackingKeyRotationEnabled: KMS Symmetric keys have automatic key rotation enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Key(nonCompliant, 'rSymmetricKey');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KMSBackingKeyRotationEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Key(compliant, 'rSymmetricKey', { enableKeyRotation: true });
    new Key(compliant, 'rAsymmetricKey', { keySpec: KeySpec.RSA_4096 });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KMSBackingKeyRotationEnabled:'),
        }),
      })
    );
  });
});

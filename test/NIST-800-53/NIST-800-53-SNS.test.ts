/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { Topic } from '@aws-cdk/aws-sns';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 SNS Compliance Checks', () => {
  describe('Amazon SNS', () => {
    test('NIST.800.53-SNSEncryptedKMS: SNS Topics are encrypted via AWS Key Management Service (KMS)', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const topic = new Topic(nonCompliant, 'rTopic');

      topic.stack;

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-SNSEncryptedKMS:'),
          }),
        })
      );

      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());
      const myKey = new Key(activeCompliant, 'rKey');
      const topic2 = new Topic(activeCompliant, 'rTopic', { masterKey: myKey });
      topic2.stack;
      const messages2 = SynthUtils.synthesize(activeCompliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-SNSEncryptedKMS:'),
          }),
        })
      );

    });
  });
});

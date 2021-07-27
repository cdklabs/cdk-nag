/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { Topic } from '@aws-cdk/aws-sns';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 Cloud Trail Compliance Checks', () => {
  describe('Amazon Cloud Trail', () => {
    test('NIST.800.53-SNSEncryptedKMS: SNS Topics are encrypted via AWS Key Management Service (KMS)', () => {

      //AC 1: Given a CDK stack with one or more non-compliant IAM users
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant user for the relevant NIST standards
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
        }),
      );

      //AC 2:
      //Given a CDK stack with compliant IAM user(s):
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for AC-2(1) NIST standard
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
        }),
      );

      //AC 3:
      //Given a CDK stack with no IAM users:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about AC-2(1) NIST standard
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());
      //no SNS topics or keys

      const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-SNSEncryptedKMS:'),
          }),
        }),
      );

    });

  });
});



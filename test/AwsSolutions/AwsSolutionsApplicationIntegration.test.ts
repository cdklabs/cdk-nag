/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { Topic } from '@aws-cdk/aws-sns';
import { CfnQueue, Queue } from '@aws-cdk/aws-sqs';
import { Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('Amazon Simple Notification Service (Amazon SNS)', () => {
  test('awsSolutionsSns2: SNS Topics have server-side encryption enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new Topic(positive, 'rTopic');
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SNS2:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new Topic(negative, 'rTopic', {
      masterKey: new Key(negative, 'rTopicKey'),
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SNS2:'),
        }),
      })
    );
  });
});

describe('Amazon Simple Queue Service (SQS)', () => {
  test('awsSolutionsSqs2: SQS queues have server-side encryption enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new Queue(positive, 'rQueue');
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SQS2:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new Queue(negative, 'rQueue', {
      encryptionMasterKey: new Key(negative, 'rQueueKey'),
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SQS2:'),
        }),
      })
    );
  });
  test('awsSolutionsSqs3: SQS queues have a dead-letter queue enabled or have a cdk_nag rule suppression indicating they are a dead-letter queue', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new Queue(positive, 'rQueue');
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SQS3:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    const dlq = new Queue(negative, 'rDlq');
    new Queue(negative, 'rQueue', {
      deadLetterQueue: { queue: dlq, maxReceiveCount: 42 },
    });
    const cfnDlq = dlq.node.defaultChild as CfnQueue;
    cfnDlq.addMetadata('cdk_nag', {
      rules_to_suppress: [
        {
          id: 'AwsSolutions-SQS3',
          reason: 'This queue is a dead-letter queue.',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SQS3:'),
        }),
      })
    );
  });
});

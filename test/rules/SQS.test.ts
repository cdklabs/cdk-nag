/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { IConstruct } from 'constructs';
import {
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagSuppressions,
} from '../../src';
import { SQSQueueDLQ, SQSQueueSSE } from '../../src/rules/sqs';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [SQSQueueDLQ, SQSQueueSSE];
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

describe('Amazon Simple Queue Service (SQS)', () => {
  test('SQSQueueDLQ: SQS queues have a dead-letter queue enabled or have a cdk_nag rule suppression indicating they are a dead-letter queue', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Queue(nonCompliant, 'rQueue');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SQSQueueDLQ:'),
        }),
      })
    );
    const compliant = new Stack();
    const pack = new TestPack();
    Aspects.of(compliant).add(pack);
    const dlq = new Queue(compliant, 'rDlq');
    new Queue(compliant, 'rQueue', {
      deadLetterQueue: { queue: dlq, maxReceiveCount: 42 },
    });
    NagSuppressions.addResourceSuppressions(dlq, [
      {
        id: `${pack.readPackName}-SQSQueueDLQ`,
        reason: 'This queue is a dead-letter queue.',
      },
    ]);
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SQSQueueDLQ:'),
        }),
      })
    );
  });

  test('SQSQueueSSE: SQS queues have server-side encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Queue(nonCompliant, 'rQueue');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SQSQueueSSE:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Queue(compliant, 'rQueue', {
      encryptionMasterKey: new Key(compliant, 'rQueueKey'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SQSQueueSSE:'),
        }),
      })
    );
  });
});

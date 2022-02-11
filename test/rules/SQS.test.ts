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
import {
  SQSQueueDLQ,
  SQSQueueSSE,
  SQSQueueSSLRequestsOnly,
} from '../../src/rules/sqs';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [SQSQueueDLQ, SQSQueueSSE, SQSQueueSSLRequestsOnly];
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

  test('SQSQueueSSLRequestsOnly: SQS queues require SSL requests', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Queue(nonCompliant, 'rQueue');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SQSQueueSSLRequestsOnly:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Queue(nonCompliant2, 'rQueue', { queueName: 'foo' });
    new CfnQueuePolicy(nonCompliant2, 'rQueuePolicy', {
      queues: ['foo'],
      policyDocument: new PolicyDocument({
        statements: [
          new PolicyStatement({
            actions: ['sqs:*'],
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            conditions: { Bool: { 'aws:SecureTransport': false } },
            resources: ['foo'],
          }),
        ],
      }).toJSON(),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SQSQueueSSLRequestsOnly:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Queue(compliant, 'rQueue', { queueName: 'foo' });
    new Queue(compliant, 'rQueue2').addToResourcePolicy(
      new PolicyStatement({
        actions: ['sqs:GetQueueUrl', '*'],
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        conditions: { Bool: { 'aws:SecureTransport': 'false' } },
        resources: ['foo'],
      })
    );
    new CfnQueuePolicy(compliant, 'rQueuePolicy', {
      queues: ['foo'],
      policyDocument: new PolicyDocument({
        statements: [
          new PolicyStatement({
            actions: ['sqs:*'],
            effect: Effect.DENY,
            principals: [new StarPrincipal()],
            conditions: { Bool: { 'aws:SecureTransport': false } },
            resources: ['foo'],
          }),
        ],
      }).toJSON(),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SQSQueueSSLRequestsOnly:'),
        }),
      })
    );
  });
});

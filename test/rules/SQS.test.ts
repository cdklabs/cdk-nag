/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AnyPrincipal,
  StarPrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnQueuePolicy, Queue } from 'aws-cdk-lib/aws-sqs';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { NagSuppressions } from '../../src';
import {
  SQSQueueDLQ,
  SQSQueueSSE,
  SQSQueueSSLRequestsOnly,
} from '../../src/rules/sqs';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  SQSQueueDLQ,
  SQSQueueSSE,
  SQSQueueSSLRequestsOnly,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Simple Queue Service (SQS)', () => {
  describe('SQSQueueDLQ: SQS queues have a dead-letter queue enabled or have a cdk-nag rule suppression indicating they are a dead-letter queue', () => {
    const ruleId = 'SQSQueueDLQ';
    test('Noncompliance 1', () => {
      new Queue(stack, 'rQueue');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      const dlq = new Queue(stack, 'rDlq');
      new Queue(stack, 'rQueue', {
        deadLetterQueue: { queue: dlq, maxReceiveCount: 42 },
      });
      NagSuppressions.addResourceSuppressions(dlq, [
        {
          id: `${testPack.readPackName}-SQSQueueDLQ`,
          reason: 'This queue is a dead-letter queue.',
        },
      ]);
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SQSQueueSSE: SQS queues have server-side encryption enabled', () => {
    const ruleId = 'SQSQueueSSE';
    test('Noncompliance 1', () => {
      new Queue(stack, 'rQueue');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Queue(stack, 'rQueue', {
        encryptionMasterKey: new Key(stack, 'rQueueKey'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SQSQueueSSLRequestsOnly: SQS queues require SSL requests', () => {
    const ruleId = 'SQSQueueSSLRequestsOnly';
    test('Noncompliance 1', () => {
      new Queue(stack, 'rQueue');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Queue(stack, 'rQueue', { queueName: 'foo' });
      new CfnQueuePolicy(stack, 'rQueuePolicy', {
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Queue(stack, 'rQueue', { queueName: 'foo' });
      new Queue(stack, 'rQueue2').addToResourcePolicy(
        new PolicyStatement({
          actions: ['sqs:GetQueueUrl', '*'],
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          conditions: { Bool: { 'aws:SecureTransport': 'false' } },
          resources: ['foo'],
        })
      );
      new CfnQueuePolicy(stack, 'rQueuePolicy', {
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

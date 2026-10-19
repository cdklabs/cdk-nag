/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnRule, Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import {
  AnyPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  StarPrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import {
  CfnSubscription,
  Subscription,
  SubscriptionProtocol,
  Topic,
} from 'aws-cdk-lib/aws-sns';
import {
  CfnQueue,
  CfnQueuePolicy,
  Queue,
  QueueEncryption,
} from 'aws-cdk-lib/aws-sqs';
import { Duration, Lazy, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack, setActivePack } from './utils';
import {
  SQSQueueDLQ,
  SQSQueueSSE,
  SQSQueueSSLRequestsOnly,
  SQSRedrivePolicy,
} from '../../src/rules/sqs';

const testPack = new TestPack([
  SQSQueueDLQ,
  SQSQueueSSE,
  SQSQueueSSLRequestsOnly,
  SQSRedrivePolicy,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack(undefined, undefined, {
    env: { account: '111222333444', region: 'us-west-2' },
  });
  setActivePack(testPack);
});

describe('Amazon Simple Queue Service (SQS)', () => {
  describe('SQSQueueDLQ: SQS queues have a dead-letter queue enabled if they are not used as a dead-letter queue', () => {
    const ruleId = 'SQSQueueDLQ';
    test('Noncompliance 1', () => {
      new Queue(stack, 'Queue');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2', () => {
      new Queue(stack, 'Dlq', { queueName: 'foo' });
      new Queue(stack, 'Queue2', {
        deadLetterQueue: {
          queue: Queue.fromQueueArn(
            stack,
            'Dlq2',
            `arn:aws:sqs:${stack.region}:${stack.account}:foo2`
          ),
          maxReceiveCount: 42,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 3', () => {
      new Queue(stack, 'Queue');
      new Function(stack, 'Function', {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 4', () => {
      new Queue(stack, 'Dlq', { queueName: 'foo' });
      new Function(stack, 'Function', {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        deadLetterQueue: Queue.fromQueueArn(
          stack,
          'Dlq2FromArn',
          `arn:aws:sqs:${stack.region}:${stack.account}:foo2`
        ),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1', () => {
      const dlq = new Queue(stack, 'Dlq');
      new Queue(stack, 'Queue', {
        deadLetterQueue: {
          queue: dlq,
          maxReceiveCount: 42,
        },
      });
      new Queue(stack, 'Dlq2', { queueName: 'foo' });
      new Queue(stack, 'Queue2', {
        deadLetterQueue: {
          queue: Queue.fromQueueArn(
            stack,
            'Dlq2FromArn',
            `arn:aws:sqs:${stack.region}:${stack.account}:foo`
          ),
          maxReceiveCount: 42,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 2', () => {
      const dlq = new Queue(stack, 'Dlq');
      new Function(stack, 'Function', {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        deadLetterQueue: dlq,
      });
      new Queue(stack, 'Dlq2', { queueName: 'foo' });
      new Function(stack, 'Function2', {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        deadLetterQueue: Queue.fromQueueArn(
          stack,
          'Dlq2FromArn',
          `arn:aws:sqs:${stack.region}:${stack.account}:foo`
        ),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Noncompliance 5', () => {
      new Queue(stack, 'Dlq', { queueName: 'foo' });
      const fn = new Function(stack, 'Function', {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      new Rule(stack, 'Rule', {
        schedule: Schedule.rate(Duration.minutes(5)),
      }).addTarget(
        new LambdaFunction(fn, {
          deadLetterQueue: Queue.fromQueueArn(
            stack,
            'Dlq2FromArn',
            `arn:aws:sqs:${stack.region}:${stack.account}:foo2`
          ),
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 3', () => {
      const dlq = new Queue(stack, 'Dlq');
      const fn = new Function(stack, 'Function', {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      new Rule(stack, 'Rule', {
        schedule: Schedule.rate(Duration.minutes(5)),
      }).addTarget(new LambdaFunction(fn, { deadLetterQueue: dlq }));
      new Queue(stack, 'Dlq2', { queueName: 'foo' });
      const fn2 = new Function(stack, 'Function2', {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      new Rule(stack, 'Rule2', {
        schedule: Schedule.rate(Duration.minutes(5)),
      }).addTarget(
        new LambdaFunction(fn2, {
          deadLetterQueue: Queue.fromQueueArn(
            stack,
            'Dlq2FromArn',
            `arn:aws:sqs:${stack.region}:${stack.account}:foo`
          ),
        })
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Noncompliance 6', () => {
      new Queue(stack, 'Dlq', { queueName: 'foo' });
      new CfnSchedule(stack, 'Schedule', {
        flexibleTimeWindow: { mode: 'OFF' },
        scheduleExpression: 'rate(5 minutes)',
        target: {
          arn: `arn:aws:sqs:${stack.region}:${stack.account}:someTarget`,
          roleArn: `arn:aws:iam::${stack.account}:role/someRole`,
          deadLetterConfig: {
            arn: `arn:aws:sqs:${stack.region}:${stack.account}:foo2`,
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 4', () => {
      const dlq = new Queue(stack, 'Dlq');
      new CfnSchedule(stack, 'Schedule', {
        flexibleTimeWindow: { mode: 'OFF' },
        scheduleExpression: 'rate(5 minutes)',
        target: {
          arn: `arn:aws:sqs:${stack.region}:${stack.account}:someTarget`,
          roleArn: `arn:aws:iam::${stack.account}:role/someRole`,
          deadLetterConfig: {
            arn: dlq.queueArn,
          },
        },
      });
      new Queue(stack, 'Dlq2', { queueName: 'foo' });
      new CfnSchedule(stack, 'Schedule2', {
        flexibleTimeWindow: { mode: 'OFF' },
        scheduleExpression: 'rate(5 minutes)',
        target: {
          arn: `arn:aws:sqs:${stack.region}:${stack.account}:someTarget`,
          roleArn: `arn:aws:iam::${stack.account}:role/someRole`,
          deadLetterConfig: {
            arn: `arn:aws:sqs:${stack.region}:${stack.account}:foo`,
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Noncompliance 7', () => {
      new Queue(stack, 'Dlq', { queueName: 'foo' });
      const topic = new Topic(stack, 'Topic');
      new Subscription(stack, 'Sub', {
        topic,
        protocol: SubscriptionProtocol.EMAIL,
        endpoint: 'a@b.com',
        deadLetterQueue: Queue.fromQueueArn(
          stack,
          'Dlq2FromArn',
          `arn:aws:sqs:${stack.region}:${stack.account}:foo2`
        ),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 5', () => {
      const dlq = new Queue(stack, 'Dlq');
      const topic = new Topic(stack, 'Topic');
      new Subscription(stack, 'Sub', {
        topic,
        protocol: SubscriptionProtocol.EMAIL,
        endpoint: 'a@b.com',
        deadLetterQueue: dlq,
      });
      new Queue(stack, 'Dlq2', { queueName: 'foo' });
      new Subscription(stack, 'Sub2', {
        topic,
        protocol: SubscriptionProtocol.EMAIL,
        endpoint: 'c@d.com',
        deadLetterQueue: Queue.fromQueueArn(
          stack,
          'Dlq2FromArn',
          `arn:aws:sqs:${stack.region}:${stack.account}:foo`
        ),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Noncompliance 8: EventBridge Rule target without a dead-letter config', () => {
      new CfnQueue(stack, 'Queue', {});
      new CfnRule(stack, 'Rule', {
        scheduleExpression: 'rate(5 minutes)',
        targets: [
          {
            arn: `arn:aws:sqs:${stack.region}:${stack.account}:someTarget`,
            id: 'Target',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 9: Scheduler Schedule without a dead-letter config', () => {
      new CfnQueue(stack, 'Queue', {});
      new CfnSchedule(stack, 'Schedule', {
        flexibleTimeWindow: { mode: 'OFF' },
        scheduleExpression: 'rate(5 minutes)',
        target: {
          arn: `arn:aws:sqs:${stack.region}:${stack.account}:someTarget`,
          roleArn: `arn:aws:iam::${stack.account}:role/someRole`,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 10: SNS Subscription without a redrive policy', () => {
      new CfnQueue(stack, 'Queue', {});
      const topic = new Topic(stack, 'Topic');
      new CfnSubscription(stack, 'Sub', {
        topicArn: topic.topicArn,
        protocol: 'email',
        endpoint: 'a@b.com',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 11: queue name containing regular expression metacharacters', () => {
      new CfnQueue(stack, 'Queue', { queueName: 'my[queue' });
      // The queue name is escaped before it is used in a regular expression, so
      // the rule reports non-compliance instead of throwing a SyntaxError
      expect(() => validateStack(stack, ruleId, TestType.ERROR)).toThrow();
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 12: EventBridge Rule targets not resolving to a list', () => {
      new CfnQueue(stack, 'Queue', {});
      new CfnRule(stack, 'Rule', {
        scheduleExpression: 'rate(5 minutes)',
        targets: Lazy.any({ produce: () => ({ Ref: 'someTargets' }) }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 13: EventBridge Rule without any target', () => {
      new CfnQueue(stack, 'Queue', {});
      new CfnRule(stack, 'Rule', {
        scheduleExpression: 'rate(5 minutes)',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
  });

  describe('SQSQueueSSE: SQS queues have server-side encryption enabled', () => {
    const ruleId = 'SQSQueueSSE';
    test('Noncompliance 1', () => {
      new Queue(stack, 'Queue', {
        encryption: QueueEncryption.UNENCRYPTED,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance 1', () => {
      new Queue(stack, 'Queue', {
        encryptionMasterKey: new Key(stack, 'QueueKey'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 2', () => {
      new Queue(stack, 'Queue', {
        encryption: QueueEncryption.SQS_MANAGED,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 3', () => {
      new Queue(stack, 'Queue');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SQSQueueSSLRequestsOnly: SQS queues require SSL requests', () => {
    const ruleId = 'SQSQueueSSLRequestsOnly';
    test('Noncompliance 1', () => {
      new Queue(stack, 'Queue');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Queue(stack, 'Queue', { queueName: 'foo' });
      new CfnQueuePolicy(stack, 'QueuePolicy', {
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
    test('Noncompliance 3: non-wildcard action', () => {
      new Queue(stack, 'Queue', { queueName: 'foo' });
      new CfnQueuePolicy(stack, 'QueuePolicy', {
        queues: ['foo'],
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['sqs:PublishMessage'],
              effect: Effect.DENY,
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
      new Queue(stack, 'Queue', { queueName: 'foo' });
      new Queue(stack, 'Queue2').addToResourcePolicy(
        new PolicyStatement({
          actions: ['sqs:GetQueueUrl', '*'],
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          conditions: { Bool: { 'aws:SecureTransport': 'false' } },
          resources: ['foo'],
        })
      );
      new CfnQueuePolicy(stack, 'QueuePolicy', {
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
      const queue3 = new Queue(stack, 'Queue3', { queueName: 'queue3' });
      new CfnQueuePolicy(stack, 'QueuePolicy3', {
        queues: ['queue3'],
        policyDocument: {
          Statement: [
            {
              Action: ['sqs:*'],
              Effect: 'Deny',
              Principal: {
                AWS: ['*'],
              },
              Resource: queue3.queueArn,
              Condition: {
                Bool: {
                  'aws:SecureTransport': false,
                },
              },
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SQSRedrivePolicy: SQS queues should have a redrive policy configured', () => {
    const ruleId = 'SQSRedrivePolicy';

    test('Noncompliance 1: L2 construct without redrive policy', () => {
      new Queue(stack, 'QueueWithoutRedrive');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2: L1 construct without redrive policy', () => {
      new CfnQueue(stack, 'L1QueueWithoutRedrive', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1: L1 construct with redrive policy', () => {
      new CfnQueue(stack, 'L1QueueWithRedrive', {
        redrivePolicy: {
          deadLetterTargetArn:
            'arn:aws:sqs:us-east-1:123456789012:DeadLetterQueue',
          maxReceiveCount: 3,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance 2: L2 construct with redrive policy', () => {
      new Queue(stack, 'QueueWithRedrive', {
        deadLetterQueue: {
          queue: Queue.fromQueueArn(
            stack,
            'Dlq2',
            `arn:aws:sqs:${stack.region}:${stack.account}:foo2`
          ),
          maxReceiveCount: 3,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

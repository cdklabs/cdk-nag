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
import { CfnSubscription, CfnTopicPolicy, Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  SNSEncryptedKMS,
  SNSRedrivePolicy,
  SNSTopicSSLPublishOnly,
} from '../../src/rules/sns';

const testPack = new TestPack([
  SNSEncryptedKMS,
  SNSRedrivePolicy,
  SNSTopicSSLPublishOnly,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Simple Notification Service (Amazon SNS)', () => {
  describe('SNSEncryptedKMS: SNS topics are encrypted via KMS', () => {
    const ruleId = 'SNSEncryptedKMS';
    test('Noncompliance', () => {
      new Topic(stack, 'Topic');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Topic(stack, 'Topic', { masterKey: new Key(stack, 'Key') });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SNSTopicSSLPublishOnly: SNS topics require SSL requests for publishing', () => {
    const ruleId = 'SNSTopicSSLPublishOnly';
    test('Noncompliance 1', () => {
      new Topic(stack, 'Topic');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Topic(stack, 'Topic', { topicName: 'foo' });
      new CfnTopicPolicy(stack, 'TopicPolicy', {
        topics: ['foo'],
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['sns:publish'],
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
      new Topic(stack, 'Topic', { topicName: 'foo' });
      new Topic(stack, 'Topic2', { masterKey: new Key(stack, 'Key') });
      new Topic(stack, 'Topic3').addToResourcePolicy(
        new PolicyStatement({
          actions: ['sns:publish', 'sns:subscribe'],
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          conditions: { Bool: { 'aws:SecureTransport': 'false' } },
          resources: ['foo'],
        })
      );
      new CfnTopicPolicy(stack, 'TopicPolicy', {
        topics: ['foo'],
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['sns:Publish'],
              effect: Effect.DENY,
              principals: [new StarPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': false } },
              resources: ['foo'],
            }),
          ],
        }).toJSON(),
      });
      const topic4 = new Topic(stack, 'Topic4', { topicName: 'topic4' });
      new CfnTopicPolicy(stack, 'TopicPolicy4', {
        topics: [topic4.topicArn],
        policyDocument: {
          Statement: [
            {
              Action: 'sns:Publish',
              Effect: 'Deny',
              Principal: {
                AWS: ['*'],
              },
              Resource: [topic4.topicArn],
              Condition: { Bool: { 'aws:SecureTransport': false } },
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SNSRedrivePolicy: SNS subscriptions have a redrive policy configured.', () => {
    const ruleId = 'SNSRedrivePolicy';

    test('Noncompliance 1: CfnSubscription without redrive policy', () => {
      new CfnSubscription(stack, 'Subscription', {
        topicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
        protocol: 'sqs',
        endpoint: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2: Subscription without redrive policy', () => {
      const topic = new Topic(stack, 'Topic');
      const queue = new Queue(stack, 'Queue');
      topic.addSubscription(new SqsSubscription(queue));
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1: CfnSubscription with redrive policy', () => {
      new CfnSubscription(stack, 'Subscription', {
        topicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
        protocol: 'sqs',
        endpoint: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
        redrivePolicy: {
          deadLetterTargetArn: 'arn:aws:sqs:us-east-1:123456789012:MyDLQ',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance 2: Subscription with redrive policy', () => {
      const topic = new Topic(stack, 'Topic');
      const queue = new Queue(stack, 'Queue');
      const dlq = new Queue(stack, 'DLQ');
      topic.addSubscription(
        new SqsSubscription(queue, {
          deadLetterQueue: dlq,
        })
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

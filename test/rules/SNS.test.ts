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
import { CfnTopicPolicy, Topic } from 'aws-cdk-lib/aws-sns';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import { SNSEncryptedKMS, SNSTopicSSLPublishOnly } from '../../src/rules/sns';

const testPack = new TestPack([SNSEncryptedKMS, SNSTopicSSLPublishOnly]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Simple Notification Service (Amazon SNS)', () => {
  describe('SNSEncryptedKMS: SNS topics are encrypted via KMS', () => {
    const ruleId = 'SNSEncryptedKMS';
    test('Noncompliance 1', () => {
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

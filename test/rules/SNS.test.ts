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
} from '@aws-cdk/aws-iam';
import { Key } from '@aws-cdk/aws-kms';
import { CfnTopicPolicy, Topic } from '@aws-cdk/aws-sns';
import { Aspects, Stack } from '@aws-cdk/core';
import { SNSEncryptedKMS, SNSTopicSSLRequestsOnly } from '../../src/rules/sns';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([SNSEncryptedKMS, SNSTopicSSLRequestsOnly]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Simple Notification Service (Amazon SNS)', () => {
  describe('SNSEncryptedKMS: SNS topics are encrypted via KMS', () => {
    const ruleId = 'SNSEncryptedKMS';
    test('Noncompliance 1', () => {
      new Topic(stack, 'rTopic');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Topic(stack, 'rTopic', { masterKey: new Key(stack, 'rKey') });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SNSTopicSSLRequestsOnly: SNS topics require SSL requests', () => {
    const ruleId = 'SNSTopicSSLRequestsOnly';
    test('Noncompliance 1', () => {
      new Topic(stack, 'rTopic');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Topic(stack, 'rTopic', { topicName: 'foo' });
      new CfnTopicPolicy(stack, 'rTopicPolicy', {
        topics: ['foo'],
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['SNS:*'],
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
      new Topic(stack, 'rTopic', { topicName: 'foo' });
      new Topic(stack, 'rTopic2', { masterKey: new Key(stack, 'rKey') });
      new Topic(stack, 'rTopic3').addToResourcePolicy(
        new PolicyStatement({
          actions: ['sns:publish', '*'],
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          conditions: { Bool: { 'aws:SecureTransport': 'false' } },
          resources: ['foo'],
        })
      );
      new CfnTopicPolicy(stack, 'rTopicPolicy', {
        topics: ['foo'],
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['sns:*'],
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

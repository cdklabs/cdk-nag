/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnEventBusPolicy } from '@aws-cdk/aws-events';
import { Aspects, Stack } from '@aws-cdk/core';
import { EventBusOpenAccess } from '../../src/rules/eventbridge';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([EventBusOpenAccess]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon EventBridge', () => {
  describe('EventBusOpenAccess: DMS replication instances are not public', () => {
    const ruleId = 'EventBusOpenAccess';
    test('Noncompliance 1', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        action: 'events:*',
        principal: '*',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: '*',
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: {
            AWS: ['arn:aws:iam::111122223333:user/alice', '*'],
          },
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: { AWS: '*' },
          Action: 'events:*',
          Condition: {},
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        action: 'events:*',
        principal: '*',
        condition: {
          key: 'foo',
          type: 'bar',
          value: 'baz',
        },
        statement: {
          Effect: 'Allow',
          Principal: '*',
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEventBusPolicy(stack, 'rPolicy1', {
        statementId: 'foo',
        action: 'events:*',
        principal: '*',
        condition: {
          key: 'foo',
          type: 'bar',
          value: 'baz',
        },
      });
      new CfnEventBusPolicy(stack, 'rPolicy2', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: '*',
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
          Condition: {
            StringEquals: { 'aws:PrincipalOrgID': 'o-1234567890' },
          },
        },
      });
      new CfnEventBusPolicy(stack, 'rPolicy3', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: {
            AWS: [
              'arn:aws:iam::111122223333:user/alice',
              'arn:aws:iam::111122223333:user/bob',
            ],
          },
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      new CfnEventBusPolicy(stack, 'rPolicy4', {
        statementId: 'foo',
        statement: {
          Effect: 'Deny',
          Principal: {
            AWS: '*',
          },
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

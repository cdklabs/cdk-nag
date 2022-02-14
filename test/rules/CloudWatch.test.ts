/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Alarm, Metric } from 'aws-cdk-lib/aws-cloudwatch';
import {
  Ec2Action,
  Ec2InstanceAction,
} from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnLogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import {
  CloudWatchAlarmAction,
  CloudWatchLogGroupEncrypted,
  CloudWatchLogGroupRetentionPeriod,
} from '../../src/rules/cloudwatch';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  CloudWatchAlarmAction,
  CloudWatchLogGroupEncrypted,
  CloudWatchLogGroupRetentionPeriod,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon CloudWatch', () => {
  describe('CloudWatchAlarmAction: CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled', () => {
    const ruleId = 'CloudWatchAlarmAction';
    test('Noncompliance 1', () => {
      new Alarm(stack, 'rAlarm', {
        metric: new Metric({
          namespace: 'MyNamespace',
          metricName: 'MyMetric',
        }),
        threshold: 100,
        evaluationPeriods: 2,
      }).addAlarmAction();
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Alarm(stack, 'rAlarm', {
        metric: new Metric({
          namespace: 'MyNamespace',
          metricName: 'MyMetric',
        }),
        threshold: 100,
        evaluationPeriods: 2,
        actionsEnabled: false,
      }).addOkAction(new Ec2Action(Ec2InstanceAction.REBOOT));
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Alarm(stack, 'rAlarm', {
        metric: new Metric({
          namespace: 'MyNamespace',
          metricName: 'MyMetric',
        }),
        threshold: 100,
        evaluationPeriods: 2,
      }).addOkAction(new Ec2Action(Ec2InstanceAction.REBOOT));
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudWatchLogGroupEncrypted: CloudWatch Log Groups are encrypted with customer managed keys', () => {
    const ruleId = 'CloudWatchLogGroupEncrypted';
    test('Noncompliance 1', () => {
      new LogGroup(stack, 'rLogGroup');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new LogGroup(stack, 'rLogGroup', {
        encryptionKey: new Key(stack, 'rLogsKey'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudWatchLogGroupRetentionPeriod: CloudWatch Log Groups have an explicit retention period configured', () => {
    const ruleId = 'CloudWatchLogGroupRetentionPeriod';
    test('Noncompliance ', () => {
      new CfnLogGroup(stack, 'rLogGroup');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LogGroup(stack, 'rLogGroup', {
        retention: RetentionDays.ONE_YEAR,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';
import { Ec2Action, Ec2InstanceAction } from '@aws-cdk/aws-cloudwatch-actions';
import { Key } from '@aws-cdk/aws-kms';
import { LogGroup } from '@aws-cdk/aws-logs';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('Amazon CloudWatch', () => {
  test('HIPAA.Security-CloudWatchAlarmAction: CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Alarm(nonCompliant, 'rAlarm', {
      metric: new Metric({
        namespace: 'MyNamespace',
        metricName: 'MyMetric',
      }),
      threshold: 100,
      evaluationPeriods: 2,
    }).addAlarmAction();
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-CloudWatchAlarmAction:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new Alarm(nonCompliant2, 'rAlarm', {
      metric: new Metric({
        namespace: 'MyNamespace',
        metricName: 'MyMetric',
      }),
      threshold: 100,
      evaluationPeriods: 2,
      actionsEnabled: false,
    }).addOkAction(new Ec2Action(Ec2InstanceAction.REBOOT));
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-CloudWatchAlarmAction:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new HIPAASecurityChecks());
    new Alarm(activeCompliant, 'rAlarm', {
      metric: new Metric({
        namespace: 'MyNamespace',
        metricName: 'MyMetric',
      }),
      threshold: 100,
      evaluationPeriods: 2,
    }).addOkAction(new Ec2Action(Ec2InstanceAction.REBOOT));
    const messages3 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-CloudWatchAlarmAction:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-CloudWatchLogGroupEncrypted: CloudWatch Log Groups are encrypted with customer managed keys', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new LogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new HIPAASecurityChecks());
    new LogGroup(activeCompliant, 'rLogGroup', {
      encryptionKey: new Key(activeCompliant, 'rLogsKey'),
    });
    const messages2 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';
import { Ec2Action, Ec2InstanceAction } from '@aws-cdk/aws-cloudwatch-actions';
import { Key } from '@aws-cdk/aws-kms';
import { CfnLogGroup, LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon CloudWatch', () => {
  test('NIST.800.53.R4-CloudWatchAlarmAction: CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - ', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
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
            'NIST.800.53.R4-CloudWatchAlarmAction:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
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
            'NIST.800.53.R4-CloudWatchAlarmAction:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R4Checks());
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
            'NIST.800.53.R4-CloudWatchAlarmAction:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R4-CloudWatchLogGroupEncrypted: CloudWatch Log Groups are encrypted with customer managed keys - ', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new LogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R4Checks());
    new LogGroup(activeCompliant, 'rLogGroup', {
      encryptionKey: new Key(activeCompliant, 'rLogsKey'),
    });
    const messages2 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R4-CloudWatchLogGroupRetentionPeriod: - CloudWatch Log Groups have an explicit retention period configured - (Control IDs: AU-11, SI-12)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new CfnLogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-CloudWatchLogGroupRetentionPeriod:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    new LogGroup(compliant, 'rLogGroup', {
      retention: RetentionDays.ONE_YEAR,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-CloudWatchLogGroupRetentionPeriod:'
          ),
        }),
      })
    );
  });
});

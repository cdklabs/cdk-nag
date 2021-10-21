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
import { NIST80053R5Checks } from '../../src';

describe('Amazon CloudWatch', () => {
  test('NIST.800.53.R5-CloudWatchAlarmAction: - CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control IDs: AU-6(1), AU-6(5), AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-36(1)(a), SI-2a, SI-4(12), SI-5b, SI-5(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-CloudWatchAlarmAction:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-CloudWatchAlarmAction:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Alarm(compliant, 'rAlarm', {
      metric: new Metric({
        namespace: 'MyNamespace',
        metricName: 'MyMetric',
      }),
      threshold: 100,
      evaluationPeriods: 2,
    }).addOkAction(new Ec2Action(Ec2InstanceAction.REBOOT));
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudWatchAlarmAction:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-CloudWatchLogGroupEncrypted: - CloudWatch Log Groups are encrypted with customer managed keys - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new LogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new LogGroup(compliant, 'rLogGroup', {
      encryptionKey: new Key(compliant, 'rLogsKey'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-CloudWatchLogGroupRetentionPeriod: - CloudWatch Log Groups have an explicit retention period configured - (Control IDs: AC-16b, AT-4b, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-10, AU-11(1), AU-11, AU-12(1), AU-12(2), AU-12(3), AU-14a, AU-14b, CA-7b, PM-14a.1, PM-14b, PM-21b, PM-31, SC-28(2), SI-4(17), SI-12)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnLogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudWatchLogGroupRetentionPeriod:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new LogGroup(compliant, 'rLogGroup', {
      retention: RetentionDays.ONE_YEAR,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudWatchLogGroupRetentionPeriod:'
          ),
        }),
      })
    );
  });
});

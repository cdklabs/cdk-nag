/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { Alarm, Metric } from 'aws-cdk-lib/aws-cloudwatch';
import {
  Ec2Action,
  Ec2InstanceAction,
} from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnLogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  CloudWatchAlarmAction,
  CloudWatchLogGroupEncrypted,
  CloudWatchLogGroupRetentionPeriod,
} from '../../src/rules/cloudwatch';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        CloudWatchAlarmAction,
        CloudWatchLogGroupEncrypted,
        CloudWatchLogGroupRetentionPeriod,
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('Amazon CloudWatch', () => {
  test('CloudWatchAlarmAction: CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('CloudWatchAlarmAction:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('CloudWatchAlarmAction:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('CloudWatchAlarmAction:'),
        }),
      })
    );
  });

  test('CloudWatchLogGroupEncrypted: CloudWatch Log Groups are encrypted with customer managed keys', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudWatchLogGroupEncrypted:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LogGroup(compliant, 'rLogGroup', {
      encryptionKey: new Key(compliant, 'rLogsKey'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudWatchLogGroupEncrypted:'),
        }),
      })
    );
  });

  test('CloudWatchLogGroupRetentionPeriod: CloudWatch Log Groups have an explicit retention period configured', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnLogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudWatchLogGroupRetentionPeriod:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LogGroup(compliant, 'rLogGroup', {
      retention: RetentionDays.ONE_YEAR,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudWatchLogGroupRetentionPeriod:'),
        }),
      })
    );
  });
});

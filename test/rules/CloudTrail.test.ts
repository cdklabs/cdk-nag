/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { Trail } from 'aws-cdk-lib/aws-cloudtrail';
import { Key } from 'aws-cdk-lib/aws-kms';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  CloudTrailCloudWatchLogsEnabled,
  CloudTrailEncryptionEnabled,
  CloudTrailLogFileValidationEnabled,
} from '../../src/rules/cloudtrail';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        CloudTrailCloudWatchLogsEnabled,
        CloudTrailEncryptionEnabled,
        CloudTrailLogFileValidationEnabled,
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

describe('AWS CloudTrail', () => {
  test('CloudTrailCloudWatchLogsEnabled: CloudTrail trails have CloudWatch logs enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());

    const trail = new Trail(nonCompliant, 'rTrail');
    trail.logAllLambdaDataEvents();

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailCloudWatchLogsEnabled:'),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new TestPack());

    const myLogs = new LogGroup(activeCompliant, 'rLogGroup');

    const trail2 = new Trail(activeCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs,
      sendToCloudWatchLogs: true,
    });

    trail2.logAllLambdaDataEvents();

    const messages2 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailCloudWatchLogsEnabled:'),
        }),
      })
    );
  });

  test('CloudTrailEncryptionEnabled: CloudTrail trails have encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());

    const myLogs = new LogGroup(nonCompliant, 'rLogGroup');

    const trail = new Trail(nonCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs,
      sendToCloudWatchLogs: true,
    });

    trail.stack;

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailEncryptionEnabled:'),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new TestPack());

    const myLogs2 = new LogGroup(activeCompliant, 'rLogGroup');

    const myKey = new Key(activeCompliant, 'rKey');

    const trail2 = new Trail(activeCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs2,
      sendToCloudWatchLogs: true,
      kmsKey: myKey,
    });

    trail2.logAllLambdaDataEvents();

    const messages2 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailEncryptionEnabled:'),
        }),
      })
    );
  });

  test('CloudTrailLogFileValidationEnabled: CloudTrail trails have log file validation enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());

    const myLogs = new LogGroup(nonCompliant, 'rLogGroup');

    const trail = new Trail(nonCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs,
      sendToCloudWatchLogs: true,
      enableFileValidation: false,
    });

    trail.stack;

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailLogFileValidationEnabled:'),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new TestPack());

    const myLogs2 = new LogGroup(activeCompliant, 'rLogGroup');

    const myKey = new Key(activeCompliant, 'rKey');

    const trail2 = new Trail(activeCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs2,
      sendToCloudWatchLogs: true,
      kmsKey: myKey,
    });

    trail2.logAllLambdaDataEvents();

    const messages2 = SynthUtils.synthesize(activeCompliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailLogFileValidationEnabled:'),
        }),
      })
    );
  });
});

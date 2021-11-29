/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Trail } from '@aws-cdk/aws-cloudtrail';
import { Key } from '@aws-cdk/aws-kms';
import { LogGroup } from '@aws-cdk/aws-logs';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
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
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailCloudWatchLogsEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const myLogs = new LogGroup(compliant, 'rLogGroup');
    const trail2 = new Trail(compliant, 'rTrail', {
      cloudWatchLogGroup: myLogs,
      sendToCloudWatchLogs: true,
    });
    trail2.logAllLambdaDataEvents();
    const messages2 = SynthUtils.synthesize(compliant).messages;
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
    new Trail(nonCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs,
      sendToCloudWatchLogs: true,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailEncryptionEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const myLogs2 = new LogGroup(compliant, 'rLogGroup');
    const myKey = new Key(compliant, 'rKey');
    const trail2 = new Trail(compliant, 'rTrail', {
      cloudWatchLogGroup: myLogs2,
      sendToCloudWatchLogs: true,
      encryptionKey: myKey,
    });
    trail2.logAllLambdaDataEvents();
    const messages2 = SynthUtils.synthesize(compliant).messages;
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
    new Trail(nonCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs,
      sendToCloudWatchLogs: true,
      enableFileValidation: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailLogFileValidationEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const myLogs2 = new LogGroup(compliant, 'rLogGroup');
    const myKey = new Key(compliant, 'rKey');
    const trail2 = new Trail(compliant, 'rTrail', {
      cloudWatchLogGroup: myLogs2,
      sendToCloudWatchLogs: true,
      encryptionKey: myKey,
    });
    trail2.logAllLambdaDataEvents();
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudTrailLogFileValidationEnabled:'),
        }),
      })
    );
  });
});

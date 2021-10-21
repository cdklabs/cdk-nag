/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Trail } from '@aws-cdk/aws-cloudtrail';
import { Key } from '@aws-cdk/aws-kms';
import { LogGroup } from '@aws-cdk/aws-logs';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('AWS CloudTrail', () => {
  test('NIST.800.53.R5-CloudTrailCloudWatchLogsEnabled: - CloudTrail trails have log file validation enabled - (Control IDs: AU-9a, CM-6a, CM-9b, PM-11b, PM-17b, SA-1(1), SA-10(1), SC-16(1), SI-1a.2, SI-1a.2, SI-1c.2, SI-4d, SI-7a, SI-7(1), SI-7(3), SI-7(7))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    const trail = new Trail(nonCompliant, 'rTrail');
    trail.logAllLambdaDataEvents();
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudTrailCloudWatchLogsEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudTrailCloudWatchLogsEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-CloudTrailEncryptionEnabled: - CloudTrail trails have encryption enabled - (Control IDs: AU-9(3), CM-6a, CM-9b, CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    const myLogs = new LogGroup(nonCompliant, 'rLogGroup');
    new Trail(nonCompliant, 'rTrail', {
      cloudWatchLogGroup: myLogs,
      sendToCloudWatchLogs: true,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudTrailEncryptionEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudTrailEncryptionEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-CloudTrailLogFileValidationEnabled: Cloud Trails have log file validation enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudTrailLogFileValidationEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-CloudTrailLogFileValidationEnabled:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Trail } from '@aws-cdk/aws-cloudtrail';
import { Key } from '@aws-cdk/aws-kms';
import { LogGroup } from '@aws-cdk/aws-logs';

import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('AWS CloudTrail', () => {
  test('HIPAA.Security-CloudTrailCloudWatchLogsEnabled: CloudTrail trails have CloudWatch logs enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());

    const trail = new Trail(nonCompliant, 'rTrail');
    trail.logAllLambdaDataEvents();

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-CloudTrailCloudWatchLogsEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new HIPAASecurityChecks());

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
            'HIPAA.Security-CloudTrailCloudWatchLogsEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-CloudTrailEncryptionEnabled: CloudTrail trails have encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());

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
          data: expect.stringContaining(
            'HIPAA.Security-CloudTrailEncryptionEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new HIPAASecurityChecks());

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
            'HIPAA.Security-CloudTrailEncryptionEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-CloudTrailLogFileValidationEnabled: Cloud Trails have log file validation enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());

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
          data: expect.stringContaining(
            'HIPAA.Security-CloudTrailLogFileValidationEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new HIPAASecurityChecks());

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
            'HIPAA.Security-CloudTrailLogFileValidationEnabled:'
          ),
        }),
      })
    );
  });
});

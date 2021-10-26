/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Trail } from '@aws-cdk/aws-cloudtrail';
import { Key } from '@aws-cdk/aws-kms';
import { LogGroup } from '@aws-cdk/aws-logs';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('AWS CloudTrail', () => {
  test('PCI.DSS.321-CloudTrailCloudWatchLogsEnabled: - CloudTrail trails have CloudWatch logs enabled - (Control IDs: 2.2, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.3, 10.5.4)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());

    const trail = new Trail(nonCompliant, 'rTrail');
    trail.logAllLambdaDataEvents();

    const messages1 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages1).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-CloudTrailCloudWatchLogsEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new PCIDSS321Checks());

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
            'PCI.DSS.321-CloudTrailCloudWatchLogsEnabled:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-CloudTrailEncryptionEnabled: - CloudTrail trails have encryption enabled - (Control IDs: 2.2, 3.4, 10.5)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());

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
            'PCI.DSS.321-CloudTrailEncryptionEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new PCIDSS321Checks());

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
            'PCI.DSS.321-CloudTrailEncryptionEnabled:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-CloudTrailLogFileValidationEnabled: - CloudTrail trails have log file validation enabled - (Control IDs: 2.2, 10.5.2, 10.5, 10.5.5, 11.5)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());

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
            'PCI.DSS.321-CloudTrailLogFileValidationEnabled:'
          ),
        }),
      })
    );

    const activeCompliant = new Stack();
    Aspects.of(activeCompliant).add(new PCIDSS321Checks());

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
            'PCI.DSS.321-CloudTrailLogFileValidationEnabled:'
          ),
        }),
      })
    );
  });
});

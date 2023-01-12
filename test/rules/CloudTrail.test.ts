/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Trail } from 'aws-cdk-lib/aws-cloudtrail';
import { Key } from 'aws-cdk-lib/aws-kms';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  CloudTrailCloudWatchLogsEnabled,
  CloudTrailEncryptionEnabled,
  CloudTrailLogFileValidationEnabled,
} from '../../src/rules/cloudtrail';

const testPack = new TestPack([
  CloudTrailCloudWatchLogsEnabled,
  CloudTrailEncryptionEnabled,
  CloudTrailLogFileValidationEnabled,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS CloudTrail', () => {
  describe('CloudTrailCloudWatchLogsEnabled: CloudTrail trails have CloudWatch logs enabled', () => {
    const ruleId = 'CloudTrailCloudWatchLogsEnabled';
    test('Noncompliance 1', () => {
      const trail = new Trail(stack, 'rTrail');
      trail.logAllLambdaDataEvents();
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      const myLogs = new LogGroup(stack, 'rLogGroup');
      const trail2 = new Trail(stack, 'rTrail', {
        cloudWatchLogGroup: myLogs,
        sendToCloudWatchLogs: true,
      });
      trail2.logAllLambdaDataEvents();
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudTrailEncryptionEnabled: CloudTrail trails have encryption enabled', () => {
    const ruleId = 'CloudTrailEncryptionEnabled';
    test('Noncompliance 1', () => {
      const myLogs = new LogGroup(stack, 'rLogGroup');
      new Trail(stack, 'rTrail', {
        cloudWatchLogGroup: myLogs,
        sendToCloudWatchLogs: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const myLogs2 = new LogGroup(stack, 'rLogGroup');
      const myKey = new Key(stack, 'rKey');
      const trail2 = new Trail(stack, 'rTrail', {
        cloudWatchLogGroup: myLogs2,
        sendToCloudWatchLogs: true,
        encryptionKey: myKey,
      });
      trail2.logAllLambdaDataEvents();
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudTrailLogFileValidationEnabled: CloudTrail trails have log file validation enabled', () => {
    const ruleId = 'CloudTrailLogFileValidationEnabled';
    test('Noncompliance 1', () => {
      const myLogs = new LogGroup(stack, 'rLogGroup');
      new Trail(stack, 'rTrail', {
        cloudWatchLogGroup: myLogs,
        sendToCloudWatchLogs: true,
        enableFileValidation: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      const myLogs2 = new LogGroup(stack, 'rLogGroup');
      const myKey = new Key(stack, 'rKey');
      const trail2 = new Trail(stack, 'rTrail', {
        cloudWatchLogGroup: myLogs2,
        sendToCloudWatchLogs: true,
        encryptionKey: myKey,
      });
      trail2.logAllLambdaDataEvents();
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

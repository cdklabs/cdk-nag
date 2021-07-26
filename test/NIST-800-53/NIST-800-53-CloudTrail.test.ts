/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Trail } from '@aws-cdk/aws-cloudtrail';
import { Key } from '@aws-cdk/aws-kms';
import { LogGroup } from '@aws-cdk/aws-logs';

import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 Cloud Trail Compliance Checks', () => {
  describe('Amazon Cloud Trail', () => {
    test('NIST.800.53-CloudTrailCloudWatchLogsEnabled: Cloud Trails have Cloud Watch logs enabled', () => {

      //AC 1: Given a CDK stack with one or more non-compliant Cloud Trails
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant trail for the relevant NIST standards
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const trail = new Trail(nonCompliant, 'rTrail');
      trail.logAllLambdaDataEvents();

      const messages1 = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages1).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CloudTrailCloudWatchLogsEnabled:'),
          }),
        }),
      );

      //AC 2:
      //Given a CDK stack with compliant Cloud Trails(s):
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for the relevant NIST standards
      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

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
            data: expect.stringContaining('NIST.800.53-CloudTrailCloudWatchLogsEnabled:'),
          }),
        }),
      );

      //AC 3:
      //Given a CDK stack with no Cloud Trails:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the revelant NIST standards
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      //no Cloud Trail resources

      const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CloudTrailCloudWatchLogsEnabled:'),
          }),
        }),
      );

    });


    test('NIST.800.53-CloudTrailEncryptionEnabled: Cloud Trails have encryption enabled', () => {

      //AC 1: Given a CDK stack with one or more non-compliant Cloud Trails
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant trail for the relevant NIST standards
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

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
            data: expect.stringContaining('NIST.800.53-CloudTrailEncryptionEnabled:'),
          }),
        }),
      );

      //AC 2:
      //Given a CDK stack with compliant Cloud Trails(s):
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for the relevant NIST standards
      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

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
            data: expect.stringContaining('NIST.800.53-CloudTrailEncryptionEnabled:'),
          }),
        }),
      );

      //AC 3:
      //Given a CDK stack with no Cloud Trails:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the revelant NIST standards
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      //no Cloud Trail resources

      const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CloudTrailEncryptionEnabled:'),
          }),
        }),
      );

    });

    test('NIST.800.53-CloudTrailLogFileValidationEnabled: Cloud Trails have log file validation enabled', () => {

      //AC 1: Given a CDK stack with one or more non-compliant Cloud Trails
      //when NIST-503 Secure Aspects is run
      //the CDK stack does not deploy and the consultant receives an explanation about the non compliant trail for the relevant NIST standards
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());

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
            data: expect.stringContaining('NIST.800.53-CloudTrailLogFileValidationEnabled:'),
          }),
        }),
      );

      //AC 2:
      //Given a CDK stack with compliant Cloud Trails(s):
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the compliant resource for the relevant NIST standards
      const activeCompliant = new Stack();
      Aspects.of(activeCompliant).add(new NIST80053Checks());

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
            data: expect.stringContaining('NIST.800.53-CloudTrailLogFileValidationEnabled:'),
          }),
        }),
      );

      //AC 3:
      //Given a CDK stack with no Cloud Trails:
      //When NIST-503 Secure Aspects is run
      //Then the CDK stack deploys and the consultant does not receive an explanation about the revelant NIST standards
      const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());

      //no Cloud Trail resources

      const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CloudTrailLogFileValidationEnabled:'),
          }),
        }),
      );

    });

  });
});

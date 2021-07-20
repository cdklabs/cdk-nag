/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { FileSystem } from '@aws-cdk/aws-efs';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Solutions Storage Checks', () => {
  describe('Amazon Simple Storage Service (Amazon S3)', () => {
    test('awsSolutionsS1: S3 Buckets have server access logs enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Bucket(positive, 'rBucket');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-S1:'),
          }),
        }),
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Bucket(negative, 'rBucket', {
        serverAccessLogsBucket: Bucket.fromBucketName(
          negative,
          'rLogsBucket',
          'foo',
        ),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-S1:'),
          }),
        }),
      );
    });
    test('awsSolutionsS2: S3 Buckets should have public access restricted and blocked', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Bucket(positive, 'rBucket', {
        blockPublicAccess: {
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: false,
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-S2:'),
          }),
        }),
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Bucket(negative, 'rBucket', {
        blockPublicAccess: {
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true,
        },
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-S2:'),
          }),
        }),
      );
    });
    test('awsSolutionsS3: S3 Buckets should have default encryption enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Bucket(positive, 'rBucket', {
        encryption: BucketEncryption.UNENCRYPTED,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-S3:'),
          }),
        }),
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Bucket(negative, 'rBucket', {
        encryption: BucketEncryption.S3_MANAGED,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-S3:'),
          }),
        }),
      );
    });
  });

  describe('Amazon Elastic File System (Amazon EFS)', () => {
    test('awsSolutionsEfs1: Elastic File Systems are configured for encryption at rest', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new FileSystem(positive, 'rEFS', {
        vpc: new Vpc(positive, 'rVpc'),
        encrypted: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EFS1:'),
          }),
        }),
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new FileSystem(negative, 'rEFS', {
        vpc: new Vpc(negative, 'rVpc'),
        encrypted: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EFS1:'),
          }),
        }),
      );
    });
  });
});

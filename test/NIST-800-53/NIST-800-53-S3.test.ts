/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 Compliance Checks', () => {
  describe('Amazon Simple Storage Service (S3)', () => {
    test('NIST.800.53-S3BucketLoggingEnabled: S3 Buckets have server access logs enabled', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      new Bucket(nonCompliant, 'rBucket');
      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-S3BucketLoggingEnabled:'
            ),
          }),
        })
      );
      const compliant = new Stack();
      Aspects.of(compliant).add(new NIST80053Checks());
      new Bucket(compliant, 'rBucket', {
        serverAccessLogsBucket: Bucket.fromBucketName(
          compliant,
          'rLogsBucket',
          'foo'
        ),
      });
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-S3BucketLoggingEnabled:'
            ),
          }),
        })
      );
    });
  });
});

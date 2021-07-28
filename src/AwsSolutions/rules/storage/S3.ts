/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets should have default encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    if (node.bucketEncryption == undefined) {
      return false;
    }
    const encryption = Stack.of(node).resolve(node.bucketEncryption);

    if (encryption.serverSideEncryptionConfiguration == undefined) {
      return false;
    }

    const sse = Stack.of(node).resolve(
      encryption.serverSideEncryptionConfiguration
    );
    for (const rule of sse) {
      const defaultEncryption = Stack.of(node).resolve(
        rule.serverSideEncryptionByDefault
      );
      if (
        defaultEncryption == undefined ||
        (defaultEncryption.sseAlgorithm.toLowerCase() != 'aes256' &&
          defaultEncryption.sseAlgorithm.toLowerCase() != 'aws:kms')
      ) {
        return false;
      }
    }
  }
  return true;
}

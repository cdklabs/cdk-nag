/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * S3 Buckets have default server-side encryption enabled - (Control IDs: AU-9(3), CM-6a, CM-9b, CP-9d, CP-9(8), PM-11b, SC-8(3), SC-8(4), SC-13a, SC-16(1), SC-28(1), SI-19(4))
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
      if (defaultEncryption == undefined) {
        return false;
      }
      const sseAlgorithm = resolveIfPrimitive(
        node,
        defaultEncryption.sseAlgorithm
      );
      if (
        sseAlgorithm.toLowerCase() != 'aes256' &&
        sseAlgorithm.toLowerCase() != 'aws:kms'
      ) {
        return false;
      }
    }
  }
  return true;
}

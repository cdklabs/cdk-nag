/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets has replication enabled - (Control IDs: AU-9(2), CP-9(b), CP-10, SC-5, SC-36)
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
  }
  return true;
}

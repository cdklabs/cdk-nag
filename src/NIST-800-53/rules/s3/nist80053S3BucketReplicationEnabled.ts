/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets have replication enabled - (Control IDs: AU-9(2), CP-9(b), CP-10, SC-5, SC-36)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const replication = Stack.of(node).resolve(node.replicationConfiguration);
    if (replication == undefined) {
      return false;
    }
  }
  return true;
}

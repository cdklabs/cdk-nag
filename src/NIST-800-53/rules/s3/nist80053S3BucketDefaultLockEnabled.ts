/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets have default lock enabled - (Control ID: SC-28)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const lock = Stack.of(node).resolve(node.objectLockEnabled);
    if (!(lock === true)) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * S3 Buckets have object lock enabled - (Control ID: SC-28)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const objectLockEnabled = resolveIfPrimitive(node, node.objectLockEnabled);
    const objectLockConfiguration = Stack.of(node).resolve(
      node.objectLockConfiguration
    );
    if (
      objectLockEnabled !== true ||
      objectLockConfiguration === undefined ||
      resolveIfPrimitive(node, objectLockConfiguration.objectLockEnabled) !==
        'Enabled'
    ) {
      return false;
    }
  }
  return true;
}

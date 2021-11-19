/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * S3 Buckets have object lock enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnBucket) {
      const objectLockEnabled = resolveIfPrimitive(
        node,
        node.objectLockEnabled
      );
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
  },
  'name',
  { value: parse(__filename).name }
);

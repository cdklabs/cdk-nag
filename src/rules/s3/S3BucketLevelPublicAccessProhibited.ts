/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * S3 Buckets prohibit public access through bucket level settings
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnBucket) {
      if (node.publicAccessBlockConfiguration == undefined) {
        return false;
      }
      const publicAccess = Stack.of(node).resolve(
        node.publicAccessBlockConfiguration
      );
      const blockPublicAcls = resolveIfPrimitive(
        node,
        publicAccess.blockPublicAcls
      );
      const blockPublicPolicy = resolveIfPrimitive(
        node,
        publicAccess.blockPublicPolicy
      );
      const ignorePublicAcls = resolveIfPrimitive(
        node,
        publicAccess.ignorePublicAcls
      );
      const restrictPublicBuckets = resolveIfPrimitive(
        node,
        publicAccess.restrictPublicBuckets
      );
      if (
        blockPublicAcls !== true ||
        blockPublicPolicy !== true ||
        ignorePublicAcls !== true ||
        restrictPublicBuckets !== true
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * S3 Buckets prohibit public write access through their Block Public Access configurations and bucket ACLs - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const publicAccessBlockConfiguration = Stack.of(node).resolve(
      node.publicAccessBlockConfiguration
    );
    if (
      publicAccessBlockConfiguration === undefined ||
      resolveIfPrimitive(
        node,
        publicAccessBlockConfiguration.blockPublicPolicy
      ) !== true
    ) {
      return false;
    }
    const accessControl = resolveIfPrimitive(node, node.accessControl);
    const blockPublicAcls = resolveIfPrimitive(
      node,
      publicAccessBlockConfiguration.blockPublicAcls
    );
    if (accessControl === 'PublicReadWrite' && blockPublicAcls !== true) {
      return false;
    }
  }
  return true;
}

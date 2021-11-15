/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs
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
    if (
      (accessControl === 'PublicRead' || accessControl === 'PublicReadWrite') &&
      blockPublicAcls !== true
    ) {
      return false;
    }
  }
  return true;
}

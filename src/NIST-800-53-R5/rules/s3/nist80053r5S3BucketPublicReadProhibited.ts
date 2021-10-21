/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-6a, CM-9b, MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)
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

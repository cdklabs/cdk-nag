/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * S3 Buckets have versioningConfiguration enabled - (Control IDs: AU-9(2), CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), PM-11b, PM-17b, SC-5(2), SC-16(1), SI-1a.2, SI-1a.2, SI-1c.2, SI-13(5))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const versioningConfiguration = Stack.of(node).resolve(
      node.versioningConfiguration
    );
    if (
      versioningConfiguration === undefined ||
      resolveIfPrimitive(node, versioningConfiguration.status) === 'Suspended'
    ) {
      return false;
    }
  }
  return true;
}

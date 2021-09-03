/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets has versioning enabled - (Control IDs: CP-10, SI-12)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const versioning = Stack.of(node).resolve(node.versioningConfiguration);
    if (versioning == undefined) {
      return false;
    } else if (versioning.status == 'Suspended') {
      return false;
    }
  }
  return true;
}

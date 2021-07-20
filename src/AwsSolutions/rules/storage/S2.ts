/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets should have public access restricted and blocked.
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    if (node.publicAccessBlockConfiguration == undefined) {
      return false;
    }
    const publicAccess = Stack.of(node).resolve(node.publicAccessBlockConfiguration);
    if (
      publicAccess.blockPublicAcls == undefined ||
      publicAccess.blockPublicPolicy == undefined ||
      publicAccess.ignorePublicAcls == undefined ||
      publicAccess.restrictPublicBuckets == undefined
    ) {
      return false;
    }
    const blockPublicAcls = Stack.of(node).resolve(publicAccess.blockPublicAcls);
    const blockPublicPolicy = Stack.of(node).resolve(publicAccess.blockPublicPolicy);
    const ignorePublicAcls = Stack.of(node).resolve(publicAccess.ignorePublicAcls);
    const restrictPublicBuckets = Stack.of(node).resolve(publicAccess.restrictPublicBuckets);
    if (
      blockPublicAcls == false ||
      blockPublicPolicy == false ||
      ignorePublicAcls == false ||
      restrictPublicBuckets == false
    ) {
      return false;
    }
  }
  return true;
}

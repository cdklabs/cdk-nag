/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource } from '@aws-cdk/core';

/**
 * S3 Buckets do not allow public read access - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const access = node.accessControl;
    if (access === 'PublicRead' || access === 'PublicReadWrite') {
      return false;
    }
  }
  return true;
}

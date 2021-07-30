/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets have logging enabled. - (Control IDs: AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const logging = Stack.of(node).resolve(node.loggingConfiguration);
    if (logging == undefined || logging.destinationBucketName == undefined) {
      return false;
    }
  }
  return true;
}

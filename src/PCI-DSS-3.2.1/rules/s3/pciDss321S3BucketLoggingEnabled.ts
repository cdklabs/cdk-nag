/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets have server access logs enabled - (Control IDs: 2.2, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.2.7, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const logging = Stack.of(node).resolve(node.loggingConfiguration);
    if (
      logging == undefined ||
      (logging.destinationBucketName == undefined &&
        logging.logFilePrefix == undefined)
    ) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets have server access logs enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);

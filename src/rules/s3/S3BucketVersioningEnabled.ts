/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * S3 Buckets have versioningConfiguration enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);

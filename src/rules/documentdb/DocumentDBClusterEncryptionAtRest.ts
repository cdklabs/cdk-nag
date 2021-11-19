/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster } from 'aws-cdk-lib/aws-docdb';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Document DB clusters have encryption at rest enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      if (node.storageEncrypted == undefined) {
        return false;
      }
      const storageEncrypted = resolveIfPrimitive(node, node.storageEncrypted);
      if (!storageEncrypted) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

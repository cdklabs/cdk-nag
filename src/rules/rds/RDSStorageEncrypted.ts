/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster, CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * RDS DB instances and Aurora DB clusters have storage encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      if (node.storageEncrypted == undefined) {
        return false;
      }
      const encrypted = resolveIfPrimitive(node, node.storageEncrypted);
      if (encrypted == false) {
        return false;
      }
    } else if (node instanceof CfnDBInstance) {
      const encrypted = resolveIfPrimitive(node, node.storageEncrypted);
      if (
        (encrypted == false || encrypted == undefined) &&
        (node.engine == undefined ||
          !node.engine.toLowerCase().includes('aurora'))
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

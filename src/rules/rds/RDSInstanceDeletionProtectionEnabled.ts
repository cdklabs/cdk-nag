/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster, CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 *  RDS DB instances and Aurora DB clusters have Deletion Protection enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      if (node.deletionProtection == undefined) {
        return false;
      }
      const deletionProtection = resolveIfPrimitive(
        node,
        node.deletionProtection
      );
      if (deletionProtection == false) {
        return false;
      }
      return true;
    } else if (node instanceof CfnDBInstance) {
      const deletionProtection = resolveIfPrimitive(
        node,
        node.deletionProtection
      );
      const engine = resolveIfPrimitive(node, node.engine);
      if (
        (deletionProtection == false || deletionProtection == undefined) &&
        (engine == undefined || !engine.toLowerCase().includes('aurora'))
      ) {
        return false;
      }
      return true;
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

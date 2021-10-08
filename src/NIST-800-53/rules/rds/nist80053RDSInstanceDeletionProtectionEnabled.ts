/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 *  RDS DB instances and Aurora DB clusters have Deletion Protection enabled - (Control ID: SC-5)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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
}

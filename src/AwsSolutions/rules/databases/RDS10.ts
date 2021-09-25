/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 *  RDS DB instances and Aurora DB clusters have Deletion Protection enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    if (node.deletionProtection == undefined) {
      return false;
    }
    const deletionProtection = Stack.of(node).resolve(node.deletionProtection);
    if (deletionProtection == false) {
      return false;
    }
    return true;
  } else if (node instanceof CfnDBInstance) {
    const deletionProtection = Stack.of(node).resolve(node.deletionProtection);
    if (
      (deletionProtection == false || deletionProtection == undefined) &&
      (node.engine == undefined ||
        !node.engine.toLowerCase().includes('aurora'))
    ) {
      return false;
    }
    return true;
  }
  return true;
}

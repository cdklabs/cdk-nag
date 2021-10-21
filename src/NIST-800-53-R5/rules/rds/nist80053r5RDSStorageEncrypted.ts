/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * RDS DB instances and Aurora DB clusters have storage encryption enabled - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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
}

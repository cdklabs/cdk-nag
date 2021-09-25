/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured - (Control IDs: 164.308(a)(5)(ii)(A), 164.308(a)(7)(ii)(A))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const allowVersionUpgrade = Stack.of(node).resolve(
      node.allowVersionUpgrade
    );
    if (
      (node.automatedSnapshotRetentionPeriod != undefined &&
        node.automatedSnapshotRetentionPeriod == 0) ||
      node.preferredMaintenanceWindow == undefined ||
      allowVersionUpgrade === false
    ) {
      return false;
    }
  }
  return true;
}

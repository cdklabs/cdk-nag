/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured - (Control IDs: CM-2b, CM-2b.1, CM-2b.2, CM-2b.3, CM-3(3), CP-9a, CP-9b, CP-9c, SC-5(2), SI-2c, SI-2d, SI-2(2), SI-2(5))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const allowVersionUpgrade = resolveIfPrimitive(
      node,
      node.allowVersionUpgrade
    );
    const automatedSnapshotRetentionPeriod = resolveIfPrimitive(
      node,
      node.automatedSnapshotRetentionPeriod
    );
    if (
      (automatedSnapshotRetentionPeriod != undefined &&
        automatedSnapshotRetentionPeriod == 0) ||
      node.preferredMaintenanceWindow == undefined ||
      allowVersionUpgrade === false
    ) {
      return false;
    }
  }
  return true;
}

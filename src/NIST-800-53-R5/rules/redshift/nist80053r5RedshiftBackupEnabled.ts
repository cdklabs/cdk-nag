/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Redshift clusters have automated snapshots enabled and the retention period is between 1 and 35 days - (Control IDs: CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const automatedSnapshotRetentionPeriod = resolveIfPrimitive(
      node,
      node.automatedSnapshotRetentionPeriod
    );
    if (
      automatedSnapshotRetentionPeriod != undefined &&
      automatedSnapshotRetentionPeriod == 0
    ) {
      return false;
    }
  }
  return true;
}

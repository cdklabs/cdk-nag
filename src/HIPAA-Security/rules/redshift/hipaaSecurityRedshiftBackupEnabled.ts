/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';

/**
 * Redshift clusters have automated snapshots enabled and the retention period is between 1 and 35 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    if (
      node.automatedSnapshotRetentionPeriod != undefined &&
      node.automatedSnapshotRetentionPeriod == 0
    ) {
      return false;
    }
  }
  return true;
}

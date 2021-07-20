/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';

/**
 * Redshift clusters have a retention period for automated snapshots configured
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

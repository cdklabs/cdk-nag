/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-redshift';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Redshift clusters have automated snapshots enabled and the retention period is between 1 and 35 days
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);

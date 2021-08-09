/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';

/**
 * ElastiCache Redis clusters have been automatically backed up (Control IDs: CP-9(b), CP-10, and SI-12)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCacheCluster) {
    const engine = node.engine.toLowerCase();
    const retention = node.snapshotRetentionLimit;
    if (engine == 'redis' && (retention == undefined || retention < 15)) {
      return false;
    }
  }
  if (node instanceof CfnReplicationGroup) {
    if (node.engine != undefined) {
      const engine = node.engine.toLowerCase();
      const retention = node.snapshotRetentionLimit;
      if (engine == 'redis' && (retention == undefined || retention < 15)) {
        return false;
      }
    }
  }
  return true;
}

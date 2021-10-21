/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * ElastiCache Redis clusters retain automatic backups for at least 15 days - (Control IDs: CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCacheCluster) {
    const engine = resolveIfPrimitive(node, node.engine.toLowerCase());
    const retention = resolveIfPrimitive(node, node.snapshotRetentionLimit);
    if (engine == 'redis' && (retention == undefined || retention < 15)) {
      return false;
    }
  } else if (node instanceof CfnReplicationGroup) {
    const retention = resolveIfPrimitive(node, node.snapshotRetentionLimit);
    if (retention == undefined || retention < 15) {
      return false;
    }
  }
  return true;
}

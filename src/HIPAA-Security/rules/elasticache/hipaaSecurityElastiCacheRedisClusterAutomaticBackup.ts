/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * ElastiCache Redis clusters retain automatic backups for at least 15 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B))
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

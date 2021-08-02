/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCacheCluster } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';

/**
 * ElastiCache Redis clusters have been automatically backed up
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCacheCluster) {
    const engine = node.engine.toLowerCase();
    if (engine == 'redis' && node.snapshotRetentionLimit >= 15) {
      return true;
    } else if (engine == 'redis' && node.snapshotRetentionLimit < 15) {
      return false;
    }
  }
  return true;
}

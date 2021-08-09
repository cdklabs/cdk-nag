/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnReplicationGroup, CfnCacheCluster } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';

/**
 * ElastiCache clusters do not use the default endpoint ports
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCacheCluster) {
    if (node.port == undefined) {
      return false;
    }
    const engine = node.engine.toLowerCase();
    if (engine == 'redis' && node.port == 6379) {
      return false;
    } else if (engine == 'memcached' && node.port == 11211) {
      return false;
    }
  } else if (node instanceof CfnReplicationGroup) {
    if (node.port == undefined) {
      return false;
    }
    if (
      (node.engine == undefined || node.engine.toLowerCase() == 'redis') &&
      node.port == 6379
    ) {
      return false;
    }
  }
  return true;
}

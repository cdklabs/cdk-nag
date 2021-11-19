/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import {
  CfnReplicationGroup,
  CfnCacheCluster,
} from 'aws-cdk-lib/aws-elasticache';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * ElastiCache clusters do not use the default endpoint ports
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCacheCluster) {
      const port = resolveIfPrimitive(node, node.port);
      if (port == undefined) {
        return false;
      }
      const engine = resolveIfPrimitive(node, node.engine);
      if (engine.toLowerCase() == 'redis' && port == 6379) {
        return false;
      } else if (engine.toLowerCase() == 'memcached' && port == 11211) {
        return false;
      }
    } else if (node instanceof CfnReplicationGroup) {
      const port = resolveIfPrimitive(node, node.port);
      if (port == undefined) {
        return false;
      }
      const engine = resolveIfPrimitive(node, node.engine);
      if (
        (engine == undefined || engine.toLowerCase() == 'redis') &&
        port == 6379
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

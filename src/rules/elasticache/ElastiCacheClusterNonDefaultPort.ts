/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnReplicationGroup, CfnCacheCluster } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * ElastiCache clusters do not use the default endpoint ports
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCacheCluster) {
      const port = NagRules.resolveIfPrimitive(node, node.port);
      if (port == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const engine = NagRules.resolveIfPrimitive(node, node.engine);
      if (engine.toLowerCase() == 'redis' && port == 6379) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else if (engine.toLowerCase() == 'memcached' && port == 11211) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnReplicationGroup) {
      const port = NagRules.resolveIfPrimitive(node, node.port);
      if (port == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const engine = NagRules.resolveIfPrimitive(node, node.engine);
      if (
        (engine == undefined || engine.toLowerCase() == 'redis') &&
        port == 6379
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * ElastiCache Redis clusters retain automatic backups for at least 15 days
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCacheCluster) {
      const engine = NagRules.resolveIfPrimitive(
        node,
        node.engine.toLowerCase()
      );
      const retention = NagRules.resolveIfPrimitive(
        node,
        node.snapshotRetentionLimit
      );
      if (engine == 'redis' && (retention == undefined || retention < 15)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnReplicationGroup) {
      const retention = NagRules.resolveIfPrimitive(
        node,
        node.snapshotRetentionLimit
      );
      if (retention == undefined || retention < 15) {
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

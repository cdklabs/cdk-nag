/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import {
  CfnCacheCluster,
  CfnReplicationGroup,
} from 'aws-cdk-lib/aws-elasticache';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * ElastiCache Redis clusters retain automatic backups for at least 15 days
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCacheCluster) {
      const engine = resolveIfPrimitive(node, node.engine.toLowerCase());
      const retention = resolveIfPrimitive(node, node.snapshotRetentionLimit);
      if (engine == 'redis' && (retention == undefined || retention < 15)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnReplicationGroup) {
      const retention = resolveIfPrimitive(node, node.snapshotRetentionLimit);
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * ElastiCache clusters are provisioned in a VPC
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (
      node instanceof CfnCacheCluster ||
      node instanceof CfnReplicationGroup
    ) {
      if (
        node.cacheSubnetGroupName == undefined ||
        node.cacheSubnetGroupName.length == 0
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

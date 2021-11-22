/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * OpenSearch Service domains have Zone Awareness enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof LegacyCfnDomain) {
      const elasticsearchClusterConfig = Stack.of(node).resolve(
        node.elasticsearchClusterConfig
      );
      if (elasticsearchClusterConfig == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const zoneAwarenessEnabled = resolveIfPrimitive(
        node,
        elasticsearchClusterConfig.zoneAwarenessEnabled
      );
      if (!zoneAwarenessEnabled) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnDomain) {
      const clusterConfig = Stack.of(node).resolve(node.clusterConfig);
      if (clusterConfig == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const zoneAwarenessEnabled = resolveIfPrimitive(
        node,
        clusterConfig.zoneAwarenessEnabled
      );
      if (!zoneAwarenessEnabled) {
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

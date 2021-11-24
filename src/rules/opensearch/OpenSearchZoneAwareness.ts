/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDomain as LegacyCfnDomain } from 'aws-cdk-lib/aws-elasticsearch';
import { CfnDomain } from 'aws-cdk-lib/aws-opensearchservice';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

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
      const zoneAwarenessEnabled = NagRules.resolveIfPrimitive(
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
      const zoneAwarenessEnabled = NagRules.resolveIfPrimitive(
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

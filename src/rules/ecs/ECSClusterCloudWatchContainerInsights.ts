/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-ecs';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * ECS Clusters have CloudWatch Container Insights Enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      if (node.clusterSettings == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const clusterSettings = Stack.of(node).resolve(node.clusterSettings);
      let found = false;
      for (const setting of clusterSettings) {
        const resolvedSetting = Stack.of(node).resolve(setting);
        if (
          resolvedSetting.name &&
          resolvedSetting.name == 'containerInsights' &&
          resolvedSetting.value &&
          (resolvedSetting.value == 'enabled' ||
            resolvedSetting.value == 'enhanced')
        ) {
          found = true;
          break;
        }
      }
      if (!found) {
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnContainer } from 'aws-cdk-lib/aws-mediastore';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * Media Store containers define metric policies to send metrics to CloudWatch
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnContainer) {
      const metricPolicy = Stack.of(node).resolve(node.metricPolicy);
      if (metricPolicy == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const containerLevelMetrics = resolveIfPrimitive(
        node,
        metricPolicy.containerLevelMetrics
      );
      if (containerLevelMetrics != 'ENABLED') {
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

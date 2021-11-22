/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import {
  CfnDistribution,
  CfnStreamingDistribution,
} from '@aws-cdk/aws-cloudfront';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * CloudFront distributions have access logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.distributionConfig
      );
      if (distributionConfig.logging == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnStreamingDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.streamingDistributionConfig
      );
      if (distributionConfig.logging == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const logging = Stack.of(node).resolve(distributionConfig.logging);
      const enabled = resolveIfPrimitive(node, logging.enabled);
      if (!enabled) {
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import {
  CfnDistribution,
  CfnStreamingDistribution,
} from 'aws-cdk-lib/aws-cloudfront';
import { CfnDeliverySource } from 'aws-cdk-lib/aws-logs';
import { NagRuleCompliance, NagRules } from '../../nag-rules';
import { flattenCfnReference } from '../../utils/flatten-cfn-reference';

const pendingDistributions: Map<string, { node: CfnResource; valid: boolean }> =
  new Map();

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
        const distributionArn = flattenCfnReference(
          Stack.of(node).resolve(
            Stack.of(node).formatArn({
              service: 'cloudfront',
              region: '',
              resource: 'distribution',
              resourceName: node.attrId,
            })
          )
        ).replace('.Id', '');
        pendingDistributions.set(distributionArn, {
          node,
          valid: false,
        });
        // TODO: If there are no CfnDeliverySource defined, then mark as NON_COMPLIANT,
        // otherwise mark as NOT_APPLICABLE to continue in the next step
        return NagRuleCompliance.NOT_APPLICABLE;
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
      const enabled = NagRules.resolveIfPrimitive(node, logging.enabled);
      if (!enabled) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnDeliverySource) {
      const deliverySourceArn = flattenCfnReference(
        Stack.of(node).resolve(node.resourceArn)
      );
      const entry = pendingDistributions.get(deliverySourceArn);
      if (entry) {
        entry.valid = true;
        pendingDistributions.set(deliverySourceArn, entry);
      }
      return NagRuleCompliance.NOT_APPLICABLE;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

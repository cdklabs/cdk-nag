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
import { CfnDelivery, CfnDeliverySource } from 'aws-cdk-lib/aws-logs';
import { NagRuleCompliance, NagRules } from '../../nag-rules';
import { flattenCfnReference } from '../../utils/flatten-cfn-reference';

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

        let deliverySourceName;
        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnDeliverySource) {
            const deliverySourceArn = flattenCfnReference(
              Stack.of(child).resolve(child.resourceArn)
            );
            const logType = Stack.of(child).resolve(child.logType);
            if (
              deliverySourceArn === distributionArn &&
              logType === 'ACCESS_LOGS'
            ) {
              deliverySourceName = Stack.of(child).resolve(child.name);
            }
          }
        }

        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnDelivery) {
            if (
              deliverySourceName ===
              Stack.of(child).resolve(child.deliverySourceName)
            ) {
              return NagRuleCompliance.COMPLIANT;
            }
          }
        }

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
      const enabled = NagRules.resolveIfPrimitive(node, logging.enabled);
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

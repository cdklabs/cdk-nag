/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * CLBs use at least two AZs with the Cross-Zone Load Balancing feature enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      if (node.crossZone == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      if (node.subnets == undefined) {
        if (
          node.availabilityZones == undefined ||
          node.availabilityZones.length < 2
        ) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      } else if (node.subnets.length < 2) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const crossZone = NagRules.resolveIfPrimitive(node, node.crossZone);
      if (crossZone != true) {
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnLoadBalancer as CfnLoadBalancerV2 } from '@aws-cdk/aws-elasticloadbalancingv2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * ELBs have access logs enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      if (node.accessLoggingPolicy == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const accessLoggingPolicy = Stack.of(node).resolve(
        node.accessLoggingPolicy
      );
      const enabled = NagRules.resolveIfPrimitive(
        node,
        accessLoggingPolicy.enabled
      );

      if (enabled == false) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnLoadBalancerV2) {
      const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
      const reg = /"access_logs\.s3\.enabled","value":"true"/gm;

      if (JSON.stringify(attributes).search(reg) == -1) {
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

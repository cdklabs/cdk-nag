/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * CLBs have connection draining enabled.
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      if (node.connectionDrainingPolicy == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const draining = Stack.of(node).resolve(node.connectionDrainingPolicy);
      const resolvedDraining = Stack.of(node).resolve(draining);
      const enabled = NagRules.resolveIfPrimitive(
        node,
        resolvedDraining.enabled
      );
      if (enabled !== true) {
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

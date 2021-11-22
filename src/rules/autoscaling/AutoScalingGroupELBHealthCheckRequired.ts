/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';
/**
 * Auto Scaling groups which are associated with load balancers utilize ELB health checks
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnAutoScalingGroup) {
      const classicLBs = Stack.of(node).resolve(node.loadBalancerNames);
      const otherLBs = Stack.of(node).resolve(node.targetGroupArns);
      if (
        (otherLBs != undefined && otherLBs.length > 0) ||
        (classicLBs != undefined && classicLBs.length > 0)
      ) {
        const healthCheckType = resolveIfPrimitive(node, node.healthCheckType);
        if (healthCheckType != undefined) {
          if (healthCheckType != 'ELB') {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        } else {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

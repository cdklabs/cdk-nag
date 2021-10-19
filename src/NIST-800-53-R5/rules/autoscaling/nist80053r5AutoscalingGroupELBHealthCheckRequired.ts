/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';
/**
 * Auto Scaling groups which are associated with load balancers utilize ELB health checks - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, CM-6a, CM-9b, PM-14a.1, PM-14b, PM-31, SC-6, SC-36(1)(a), SI-2a)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
}

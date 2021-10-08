/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';
/**
 * Auto Scaling groups which are associated with load balancers utilize ELB health checks - (Control ID: 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnAutoScalingGroup) {
    //get all associated CLBs
    const classicLBs = Stack.of(node).resolve(node.loadBalancerNames);
    //get all associated Application LBs, Gateway LBs, and Network LBs
    const otherLBs = Stack.of(node).resolve(node.targetGroupArns);
    if (
      (otherLBs != undefined && otherLBs.length > 0) ||
      (classicLBs != undefined && classicLBs.length > 0)
    ) {
      const healthCheckType = resolveIfPrimitive(node, node.healthCheckType);
      //Do we use ELB health checks?
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

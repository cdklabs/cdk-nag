/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Autoscaling groups utilize ELB health checks - (Control IDs: SC-5)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnAutoScalingGroup) {
    //get all associated CLASSIC load balancers
    const classicLBs = Stack.of(node).resolve(node.loadBalancerNames);
    //get all associated Application LBs, Gateway LBs, and Network LBs
    const otherLBs = Stack.of(node).resolve(node.targetGroupArns);
    if ( (otherLBs != undefined && otherLBs.length > 0) ||
         (classicLBs != undefined && classicLBs.length > 0) ) {
      const healthCheckType = Stack.of(node).resolve(node.healthCheckType);
      //Did we use ELB health checks?
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

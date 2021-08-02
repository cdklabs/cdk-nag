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
    //Is the VPC property set?
    const ELBTargets = Stack.of(node).resolve(node.targetGroupArns);
    if (ELBTargets != undefined) {
      const healthCheckType = Stack.of(node).resolve(node.healthCheckType);
      if (healthCheckType == undefined || healthCheckType != 'ELB') {
        return false;
      }
    }
  }
  return true;
}

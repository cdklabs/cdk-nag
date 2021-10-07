/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Auto Scaling Groups have configured cooldown periods
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnAutoScalingGroup) {
    const cooldown = Stack.of(node).resolve(node.cooldown);
    if (cooldown != undefined && parseInt(cooldown) == 0) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Auto Scaling Groups have properly configured health checks
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnAutoScalingGroup) {
    const healthCheckType = Stack.of(node).resolve(node.healthCheckType);
    const healthCheckGracePeriod = Stack.of(node).resolve(
      node.healthCheckGracePeriod,
    );
    if (
      healthCheckType != undefined &&
      healthCheckType == 'ELB' &&
      healthCheckGracePeriod == undefined
    ) {
      return false;
    }
  }
  return true;
}

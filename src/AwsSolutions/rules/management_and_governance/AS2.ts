/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Auto Scaling Groups have properly configured health checks
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnAutoScalingGroup) {
    const healthCheckType = resolveIfPrimitive(node, node.healthCheckType);
    const healthCheckGracePeriod = resolveIfPrimitive(
      node,
      node.healthCheckGracePeriod
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

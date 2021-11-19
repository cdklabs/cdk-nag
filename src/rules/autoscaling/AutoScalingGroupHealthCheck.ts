/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnAutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Auto Scaling Groups have properly configured health checks
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);

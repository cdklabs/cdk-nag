/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Auto Scaling Groups have configured cooldown periods
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnAutoScalingGroup) {
      const cooldown = resolveIfPrimitive(node, node.cooldown);
      if (cooldown != undefined && parseInt(cooldown) == 0) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

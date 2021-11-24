/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * Auto Scaling Groups have properly configured health checks
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
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
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

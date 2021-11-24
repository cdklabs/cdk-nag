/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnAutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Auto Scaling Groups have configured cooldown periods
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnAutoScalingGroup) {
      const cooldown = NagRules.resolveIfPrimitive(node, node.cooldown);
      if (cooldown != undefined && parseInt(cooldown) == 0) {
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

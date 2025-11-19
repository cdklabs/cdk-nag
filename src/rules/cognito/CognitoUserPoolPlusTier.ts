/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnUserPool, FeaturePlan } from 'aws-cdk-lib/aws-cognito';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Cognito user pools are plus tier
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnUserPool) {
      const userPoolTier = NagRules.resolveIfPrimitive(node, node.userPoolTier);
      return userPoolTier == undefined || userPoolTier != FeaturePlan.PLUS
        ? NagRuleCompliance.NON_COMPLIANT
        : NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

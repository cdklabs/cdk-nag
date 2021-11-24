/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnUserPool } from '@aws-cdk/aws-cognito';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Cognito user pools have AdvancedSecurityMode set to ENFORCED
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnUserPool) {
      const userPoolAddOns = Stack.of(node).resolve(node.userPoolAddOns);
      if (userPoolAddOns == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const advancedSecurityMode = NagRules.resolveIfPrimitive(
        node,
        userPoolAddOns.advancedSecurityMode
      );
      if (
        advancedSecurityMode == undefined ||
        advancedSecurityMode != 'ENFORCED'
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

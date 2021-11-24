/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnUserPool } from '@aws-cdk/aws-cognito';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Cognito user pools have password policies that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnUserPool) {
      const policies = Stack.of(node).resolve(node.policies);
      if (policies == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const passwordPolicy = Stack.of(node).resolve(policies.passwordPolicy);
      if (passwordPolicy == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const minimumLength = NagRules.resolveIfPrimitive(
        node,
        passwordPolicy.minimumLength
      );
      if (minimumLength == undefined || minimumLength < 8) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const requireUppercase = NagRules.resolveIfPrimitive(
        node,
        passwordPolicy.requireUppercase
      );
      if (requireUppercase !== true) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const requireNumbers = NagRules.resolveIfPrimitive(
        node,
        passwordPolicy.requireNumbers
      );
      if (requireNumbers !== true) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const requireSymbols = NagRules.resolveIfPrimitive(
        node,
        passwordPolicy.requireSymbols
      );
      if (requireSymbols !== true) {
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

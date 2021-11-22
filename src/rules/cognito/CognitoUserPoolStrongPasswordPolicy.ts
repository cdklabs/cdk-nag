/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnUserPool } from 'aws-cdk-lib/aws-cognito';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

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

      const minimumLength = resolveIfPrimitive(
        node,
        passwordPolicy.minimumLength
      );
      if (minimumLength == undefined || minimumLength < 8) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const requireUppercase = resolveIfPrimitive(
        node,
        passwordPolicy.requireUppercase
      );
      if (requireUppercase !== true) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const requireNumbers = resolveIfPrimitive(
        node,
        passwordPolicy.requireNumbers
      );
      if (requireNumbers !== true) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const requireSymbols = resolveIfPrimitive(
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

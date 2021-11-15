/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnUserPool } from '@aws-cdk/aws-cognito';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Cognito user pools have password policies that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnUserPool) {
      const policies = Stack.of(node).resolve(node.policies);
      if (policies == undefined) {
        return false;
      }
      const passwordPolicy = Stack.of(node).resolve(policies.passwordPolicy);
      if (passwordPolicy == undefined) {
        return false;
      }

      const minimumLength = resolveIfPrimitive(
        node,
        passwordPolicy.minimumLength
      );
      if (minimumLength == undefined || minimumLength < 8) {
        return false;
      }

      const requireUppercase = resolveIfPrimitive(
        node,
        passwordPolicy.requireUppercase
      );
      if (requireUppercase !== true) {
        return false;
      }

      const requireNumbers = resolveIfPrimitive(
        node,
        passwordPolicy.requireNumbers
      );
      if (requireNumbers !== true) {
        return false;
      }

      const requireSymbols = resolveIfPrimitive(
        node,
        passwordPolicy.requireSymbols
      );
      if (requireSymbols !== true) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

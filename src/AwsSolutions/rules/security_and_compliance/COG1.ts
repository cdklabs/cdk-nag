/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnUserPool } from '@aws-cdk/aws-cognito';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Cognito user pools have password policies that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnUserPool) {
    const policies = Stack.of(node).resolve(node.policies);
    if (policies == undefined) {
      return false;
    }
    const passwordPolicy = Stack.of(node).resolve(policies.passwordPolicy);
    if (passwordPolicy == undefined) {
      return false;
    }

    const minimumLength = Stack.of(node).resolve(passwordPolicy.minimumLength);
    if (minimumLength == undefined || minimumLength < 8) {
      return false;
    }

    const requireUppercase = Stack.of(node).resolve(
      passwordPolicy.requireUppercase
    );
    if (minimumLength == undefined || !requireUppercase) {
      return false;
    }

    const requireNumbers = Stack.of(node).resolve(
      passwordPolicy.requireNumbers
    );
    if (requireNumbers == undefined || !requireNumbers) {
      return false;
    }

    const requireSymbols = Stack.of(node).resolve(
      passwordPolicy.requireSymbols
    );
    if (requireSymbols == undefined || !requireSymbols) {
      return false;
    }
  }
  return true;
}

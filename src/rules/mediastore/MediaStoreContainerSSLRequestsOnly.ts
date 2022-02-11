/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnContainer } from '@aws-cdk/aws-mediastore';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Media Store containers require requests to use SSL
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnContainer) {
      const policy = Stack.of(node).resolve(node.policy);
      if (policy === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const parsedPolicy = JSON.parse(policy);
      let found = false;
      for (const statement of parsedPolicy?.Statement) {
        const resolvedStatement = Stack.of(node).resolve(statement);
        const secureTransport =
          resolvedStatement?.Condition?.Bool?.['aws:SecureTransport'];
        console.log(secureTransport);
        if (
          resolvedStatement.Effect === 'Deny' &&
          checkMatchingAction(resolvedStatement.Action) === true &&
          checkMatchingPrincipal(resolvedStatement.Principal) === true &&
          (secureTransport === 'false' || secureTransport === false)
        ) {
          found = true;
          break;
        }
      }
      if (!found) {
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

/**
 * Helper function to check whether the Bucket Policy applies to all actions
 * @param node The policy statement to check
 * @param actions The action in the bucket policy
 * @returns Whether the policy statement applies to all actions
 */
function checkMatchingAction(actions: any): boolean {
  if (Array.isArray(actions)) {
    for (const action of actions) {
      if (action === '*' || action === 'mediastore:*') {
        return true;
      }
    }
  } else if (actions === '*' || actions === 'mediastore:*') {
    return true;
  }
  return false;
}

/**
 * Helper function to check whether the Bucket Policy applies to all principals
 * @param node The policy statement to check
 * @param principal The principals in the bucket policy
 * @returns Whether the policy statement applies to all principals
 */
function checkMatchingPrincipal(principals: any): boolean {
  if (principals === '*') {
    return true;
  }
  const awsPrincipal = principals.AWS;
  if (Array.isArray(awsPrincipal)) {
    for (const account of awsPrincipal) {
      if (account === '*') {
        return true;
      }
    }
  } else if (awsPrincipal === '*') {
    return true;
  }
  return false;
}

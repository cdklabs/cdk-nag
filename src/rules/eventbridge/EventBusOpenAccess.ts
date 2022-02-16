/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEventBusPolicy } from 'aws-cdk-lib/aws-events';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * EventBridge event bus policies do not allow for open access
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnEventBusPolicy) {
      if (Stack.of(node).resolve(node.principal) === '*') {
        const condition = Stack.of(node).resolve(node.condition);
        if (
          condition === undefined ||
          condition.key === undefined ||
          condition.type === undefined ||
          condition.value === undefined
        ) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      const resolvedStatement = Stack.of(node).resolve(node.statement);
      if (resolvedStatement !== undefined) {
        const condition = Stack.of(node).resolve(resolvedStatement?.Condition);
        if (
          resolvedStatement?.Effect === 'Allow' &&
          checkMatchingPrincipal(resolvedStatement?.Principal) === true &&
          (condition === undefined || JSON.stringify(condition) === '{}')
        ) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
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
 * Helper function to check whether the event bus policy applies to all principals
 * @param node The CfnEventBusPolicy to check
 * @param principal The principals in the event bus policy
 * @returns Whether the CfnEventBusPolicy applies to all principals
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

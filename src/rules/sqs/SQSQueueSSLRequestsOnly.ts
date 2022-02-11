/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnQueue, CfnQueuePolicy } from '@aws-cdk/aws-sqs';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * SQS queues require SSL requests
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnQueue) {
      const queueLogicalId = NagRules.resolveResourceFromInstrinsic(
        node,
        node.ref
      );
      const queueName = Stack.of(node).resolve(node.queueName);
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnQueuePolicy) {
          if (isMatchingCompliantPolicy(child, queueLogicalId, queueName)) {
            found = true;
            break;
          }
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
 * Helper function to check whether the queue Policy requires SSL on the given queue.
 * @param node The CfnQueuePolicy to check.
 * @param queueLogicalId The Cfn Logical ID of the queue.
 * @param queueName The name of the queue.
 * @returns Whether the CfnQueuePolicy requires SSL on the given queue.
 */
function isMatchingCompliantPolicy(
  node: CfnQueuePolicy,
  queueLogicalId: string,
  queueName: string | undefined
): boolean {
  let found = false;
  for (const queue of node.queues) {
    const resolvedQueue = NagRules.resolveResourceFromInstrinsic(node, queue);
    if (
      resolvedQueue === queueLogicalId ||
      (queueName !== undefined && (<string>resolvedQueue).endsWith(queueName))
    ) {
      found = true;
      break;
    }
  }
  if (!found) {
    return false;
  }
  const resolvedPolicyDocument = Stack.of(node).resolve(node.policyDocument);
  for (const statement of resolvedPolicyDocument.Statement) {
    const resolvedStatement = Stack.of(node).resolve(statement);
    const secureTransport =
      resolvedStatement?.Condition?.Bool?.['aws:SecureTransport'];
    if (
      resolvedStatement.Effect === 'Deny' &&
      checkMatchingAction(resolvedStatement.Action) === true &&
      checkMatchingPrincipal(resolvedStatement.Principal) === true &&
      (secureTransport === 'false' || secureTransport === false)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function to check whether the queue Policy applies to queue actions
 * @param node The CfnQueuePolicy to check
 * @param actions The action in the queue policy
 * @returns Whether the CfnQueuePolicy applies to queue actions
 */
function checkMatchingAction(actions: any): boolean {
  if (Array.isArray(actions)) {
    for (const action of actions) {
      if (action === '*' || action.toLowerCase() === 'sqs:*') {
        return true;
      }
    }
  } else if (actions === '*' || actions.toLowerCase() === 'sqs:*') {
    return true;
  }
  return false;
}

/**
 * Helper function to check whether the queue Policy applies to all principals
 * @param node The CfnQueuePolicy to check
 * @param principal The principals in the queue policy
 * @returns Whether the CfnQueuePolicy applies to all principals
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

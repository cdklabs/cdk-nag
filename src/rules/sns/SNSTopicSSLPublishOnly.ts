/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnTopic, CfnTopicPolicy } from 'aws-cdk-lib/aws-sns';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * SNS topics require SSL requests for publishing
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnTopic) {
      const topicKey = Stack.of(node).resolve(node.kmsMasterKeyId);
      if (topicKey === undefined) {
        const topicLogicalId = NagRules.resolveResourceFromIntrinsic(
          node,
          node.ref
        );
        const topicName = Stack.of(node).resolve(node.topicName);
        let found = false;
        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnTopicPolicy) {
            if (isMatchingCompliantPolicy(child, topicLogicalId, topicName)) {
              found = true;
              break;
            }
          }
        }
        if (!found) {
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
 * Helper function to check whether the topic Policy requires SSL on the given topic.
 * @param node The CfnTopicPolicy to check.
 * @param topicLogicalId The Cfn Logical ID of the topic.
 * @param topicName The name of the topic.
 * @returns Whether the CfnTopicPolicy requires SSL on the given topic.
 */
function isMatchingCompliantPolicy(
  node: CfnTopicPolicy,
  topicLogicalId: string,
  topicName: string | undefined
): boolean {
  let found = false;
  for (const topic of node.topics) {
    const resolvedTopic = NagRules.resolveResourceFromIntrinsic(node, topic);
    if (
      resolvedTopic === topicLogicalId ||
      (topicName !== undefined && (<string>resolvedTopic).endsWith(topicName))
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
 * Helper function to check whether the topic Policy applies to topic actions
 * @param node The CfnTopicPolicy to check
 * @param actions The action in the topic policy
 * @returns Whether the CfnTopicPolicy applies to topic actions
 */
function checkMatchingAction(actions: any): boolean {
  if (Array.isArray(actions)) {
    for (const action of actions) {
      if (action.toLowerCase() === 'sns:publish') {
        return true;
      }
    }
  } else if (actions.toLowerCase() === 'sns:publish') {
    return true;
  }
  return false;
}

/**
 * Helper function to check whether the topic Policy applies to all principals
 * @param node The CfnTopicPolicy to check
 * @param principal The principals in the topic policy
 * @returns Whether the CfnTopicPolicy applies to all principals
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

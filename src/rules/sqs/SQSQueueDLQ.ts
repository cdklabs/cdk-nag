/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnQueue } from 'aws-cdk-lib/aws-sqs';
import { NagRuleCompliance, NagRules } from '../../nag-rules';
import { flattenCfnReference } from '../../utils/flatten-cfn-reference';

/**
 * SQS queues have a dead-letter queue enabled if they are not used as a dead-letter queue
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnQueue) {
      const redrivePolicy = Stack.of(node).resolve(node.redrivePolicy);
      if (redrivePolicy === undefined) {
        const queueLogicalId = NagRules.resolveResourceFromInstrinsic(
          node,
          node.ref
        );
        const queueName = Stack.of(node).resolve(node.queueName);
        let found = false;
        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnQueue) {
            if (isMatchingQueue(child, queueLogicalId, queueName)) {
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
 * Helper function to check whether a given SQS Queue uses the target SQS queue as a DLQ
 * @param node the CfnQueue to check
 * @param queueLogicalId the Cfn Logical ID of the target queue
 * @param queueName the name of the target queue
 * returns whether the CfnQueue uses the target SQS queue as a DLQ
 */
function isMatchingQueue(
  node: CfnQueue,
  queueLogicalId: string,
  queueName: string | undefined
): boolean {
  const redrivePolicy = Stack.of(node).resolve(node.redrivePolicy);
  const deadLetterTargetArn = flattenCfnReference(
    redrivePolicy?.deadLetterTargetArn ?? ''
  );
  if (
    new RegExp(`${queueLogicalId}(?![\\w])`).test(deadLetterTargetArn) ||
    (queueName !== undefined &&
      new RegExp(`:${queueName}(?![\\w\\-_\\.])`).test(deadLetterTargetArn))
  ) {
    return true;
  }
  return false;
}

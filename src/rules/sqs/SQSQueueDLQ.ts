/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRule } from 'aws-cdk-lib/aws-events';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import { CfnSubscription } from 'aws-cdk-lib/aws-sns';
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
        const queueLogicalId = NagRules.resolveResourceFromIntrinsic(
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
          } else if (child instanceof CfnFunction) {
            if (isMatchingLambdaFunction(child, queueLogicalId, queueName)) {
              found = true;
              break;
            }
          } else if (child instanceof CfnRule) {
            if (isMatchingEventBridgeRule(child, queueLogicalId, queueName)) {
              found = true;
              break;
            }
          } else if (child instanceof CfnSchedule) {
            if (isMatchingSchedulerSchedule(child, queueLogicalId, queueName)) {
              found = true;
              break;
            }
          } else if (child instanceof CfnSubscription) {
            if (isMatchingSNSSubscription(child, queueLogicalId, queueName)) {
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
  return isMatchingDeadLetterTarget(
    deadLetterTargetArn,
    queueLogicalId,
    queueName
  );
}

/**
 * Helper function to check whether a given Lambda Function uses the target SQS queue as a DLQ
 * @param node the CfnFunction to check
 * @param queueLogicalId the Cfn Logical ID of the target queue
 * @param queueName the name of the target queue
 * returns whether the CfnFunction uses the target SQS queue as a DLQ
 */
function isMatchingLambdaFunction(
  node: CfnFunction,
  queueLogicalId: string,
  queueName: string | undefined
): boolean {
  const deadLetterConfig = Stack.of(node).resolve(node.deadLetterConfig);
  const targetArn = flattenCfnReference(
    Stack.of(node).resolve(deadLetterConfig?.targetArn) ?? ''
  );
  return isMatchingDeadLetterTarget(targetArn, queueLogicalId, queueName);
}

/**
 * Helper function to check whether a given EventBridge Rule uses the target SQS queue as a DLQ
 * @param node the CfnRule to check
 * @param queueLogicalId the Cfn Logical ID of the target queue
 * @param queueName the name of the target queue
 * returns whether the CfnRule uses the target SQS queue as a DLQ
 */
function isMatchingEventBridgeRule(
  node: CfnRule,
  queueLogicalId: string,
  queueName: string | undefined
): boolean {
  const targets = Stack.of(node).resolve(node.targets) ?? [];
  if (!Array.isArray(targets)) {
    return false;
  }
  for (const target of targets as CfnRule.TargetProperty[]) {
    const deadLetterConfig = Stack.of(node).resolve(target?.deadLetterConfig);
    const targetArn = flattenCfnReference(deadLetterConfig?.arn ?? '');
    if (isMatchingDeadLetterTarget(targetArn, queueLogicalId, queueName)) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function to check whether a given EventBridge Scheduler Schedule uses the target SQS queue as a DLQ
 * @param node the CfnSchedule to check
 * @param queueLogicalId the Cfn Logical ID of the target queue
 * @param queueName the name of the target queue
 * returns whether the CfnSchedule uses the target SQS queue as a DLQ
 */
function isMatchingSchedulerSchedule(
  node: CfnSchedule,
  queueLogicalId: string,
  queueName: string | undefined
): boolean {
  const target = Stack.of(node).resolve(node.target);
  const deadLetterConfig = Stack.of(node).resolve(target?.deadLetterConfig);
  const targetArn = flattenCfnReference(deadLetterConfig?.arn ?? '');
  return isMatchingDeadLetterTarget(targetArn, queueLogicalId, queueName);
}

/**
 * Helper function to check whether a given SNS Subscription uses the target SQS queue as a DLQ
 * @param node the CfnSubscription to check
 * @param queueLogicalId the Cfn Logical ID of the target queue
 * @param queueName the name of the target queue
 * returns whether the CfnSubscription uses the target SQS queue as a DLQ
 */
function isMatchingSNSSubscription(
  node: CfnSubscription,
  queueLogicalId: string,
  queueName: string | undefined
): boolean {
  const redrivePolicy = Stack.of(node).resolve(node.redrivePolicy);
  const deadLetterTargetArn = flattenCfnReference(
    redrivePolicy?.deadLetterTargetArn ?? ''
  );
  return isMatchingDeadLetterTarget(
    deadLetterTargetArn,
    queueLogicalId,
    queueName
  );
}

/**
 * Helper function to check whether a given dead-letter target ARN references the target SQS queue
 * @param deadLetterArn the ARN (or Cfn reference) of the dead-letter target to check
 * @param queueLogicalId the Cfn Logical ID of the target queue
 * @param queueName the name of the target queue
 * returns whether the dead-letter target ARN references the target SQS queue
 */
function isMatchingDeadLetterTarget(
  deadLetterArn: string,
  queueLogicalId: string,
  queueName: string | undefined
): boolean {
  return (
    new RegExp(`${escapeRegExp(queueLogicalId)}(?![\\w])`).test(
      deadLetterArn
    ) ||
    (queueName !== undefined &&
      new RegExp(`:${escapeRegExp(queueName)}(?![\\w\\-_\\.])`).test(
        deadLetterArn
      ))
  );
}

/**
 * Helper function to escape regular expression metacharacters in a literal
 * @param literal the literal to escape
 * returns the literal with all regular expression metacharacters escaped
 */
function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

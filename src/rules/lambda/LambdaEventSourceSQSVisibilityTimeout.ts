/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEventSourceMapping, CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { CfnQueue } from 'aws-cdk-lib/aws-sqs';
import { NagRuleCompliance } from '../../nag-rules';
import { flattenCfnReference } from '../../utils/flatten-cfn-reference';

/**
 * SQS queue visibility timeout of Lambda Event Source Mapping is at least 6 times timeout of Lambda function
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnEventSourceMapping) {
      const sourceArn = flattenCfnReference(
        Stack.of(node).resolve(node.eventSourceArn) ?? ''
      );
      if (!sourceArn) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      const sourceSqsQueue = getSourceSqsQueue(node, sourceArn);
      if (!sourceSqsQueue) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      const queueVisibilityTimeoutSetting = Stack.of(node).resolve(
        sourceSqsQueue.visibilityTimeout
      );
      const queueVisibilityTimeout =
        typeof queueVisibilityTimeoutSetting === 'number' // can be 0, just testing for value truthiness would be wrong
          ? queueVisibilityTimeoutSetting
          : 30; // default SQS Queue visibility timeout
      const lambdaFunctionTimeout = getLambdaFunctionTimeout(node);
      if (!lambdaFunctionTimeout) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (lambdaFunctionTimeout > queueVisibilityTimeout / 6) {
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
 * Helper function to get the SQS queue of the Event Source Mapping
 * @param node the CfnEventSourceMapping
 * @param sourceArn the already flattened reference to the source Arn
 * returns the source CfnQueue or undefined if not found
 */
function getSourceSqsQueue(
  node: CfnEventSourceMapping,
  sourceArn: string
): CfnQueue | undefined {
  for (const child of Stack.of(node).node.findAll()) {
    if (
      child instanceof CfnQueue &&
      flattenCfnReference(Stack.of(node).resolve(child.attrArn)) === sourceArn
    ) {
      return child;
    }
  }
  return undefined;
}

/**
 * Helper function to get timeout setting of the CfnEventSourceMapping's Lambda function
 * @param node the CfnEventSourceMapping
 * returns the timeout value of the Lambda function or undefined if not found
 */
function getLambdaFunctionTimeout(
  node: CfnEventSourceMapping
): number | undefined {
  const functionRef = flattenCfnReference(
    Stack.of(node).resolve(node.functionName)
  );
  for (const child of Stack.of(node).node.findAll()) {
    if (
      child instanceof CfnFunction &&
      flattenCfnReference(functionRef) ===
        flattenCfnReference(Stack.of(node).resolve(child.ref))
    ) {
      const timeoutSetting = Stack.of(node).resolve(child.timeout);
      if (typeof timeoutSetting === 'number') {
        return timeoutSetting;
      } else {
        return 3; // default Lambda function timeout
      }
    }
  }
  return undefined;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnQueue } from 'aws-cdk-lib/aws-sqs';

/**
 * SQS queues have a dead-letter queue enabled or have a cdk_nag rule suppression indicating they are a dead-letter queue.
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnQueue) {
      const redrivePolicy = Stack.of(node).resolve(node.redrivePolicy);
      if (redrivePolicy == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

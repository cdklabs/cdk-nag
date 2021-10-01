/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnQueue } from '@aws-cdk/aws-sqs';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * SQS queues have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnQueue) {
    const kmsMasterKeyId = Stack.of(node).resolve(node.kmsMasterKeyId);
    if (kmsMasterKeyId == undefined) {
      return false;
    }
  }
  return true;
}

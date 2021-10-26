/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTopic } from '@aws-cdk/aws-sns';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * SNS topics are encrypted via KMS - (Control ID: 8.2.1)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnTopic) {
    const topicKey = Stack.of(node).resolve(node.kmsMasterKeyId);
    if (topicKey == undefined) {
      return false;
    }
  }
  return true;
}

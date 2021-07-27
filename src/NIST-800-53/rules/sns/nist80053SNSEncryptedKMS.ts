/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTopic } from '@aws-cdk/aws-sns';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * SNS topics are encrypted via KMS
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnTopic) {
    const topicKey = Stack.of(node).resolve(node.kmsMasterKeyId);
    if (topicKey == undefined) {
      return false;
    }
  }
  return true;
}

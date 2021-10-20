/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTopic } from '@aws-cdk/aws-sns';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * SNS topics are encrypted via KMS - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1))
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

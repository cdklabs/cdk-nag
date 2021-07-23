/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTable } from '@aws-cdk/aws-dynamodb';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * DynamoDB tables are encrypted in KMS
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnTable) {
    if (node.sseSpecification == undefined) {
      return false;
    }
    const sseSpecification = Stack.of(node).resolve(node.sseSpecification);
    const enabled = Stack.of(node).resolve(sseSpecification.sseEnabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}
/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTable } from '@aws-cdk/aws-dynamodb';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * DynamoDB tables have Point-in-time Recovery enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnTable) {
    if (node.pointInTimeRecoverySpecification == undefined) {
      return false;
    }
    const pitr = Stack.of(node).resolve(node.pointInTimeRecoverySpecification);
    const enabled = resolveIfPrimitive(node, pitr.pointInTimeRecoveryEnabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}

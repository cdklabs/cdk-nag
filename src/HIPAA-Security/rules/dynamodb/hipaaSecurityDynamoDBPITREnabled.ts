/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTable } from '@aws-cdk/aws-dynamodb';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * DynamoDB tables have Point-in-time Recovery enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B))
 * @param node the CfnResource to check
 */

export default function (node: CfnResource): boolean {
  if (node instanceof CfnTable) {
    if (node.pointInTimeRecoverySpecification == undefined) {
      return false;
    }
    const pitr = Stack.of(node).resolve(node.pointInTimeRecoverySpecification);
    const enabled = Stack.of(node).resolve(pitr.pointInTimeRecoveryEnabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}

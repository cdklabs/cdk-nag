/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * ElastiCache Redis clusters have both encryption in transit and at rest enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnReplicationGroup) {
    if (
      node.atRestEncryptionEnabled == undefined ||
      node.transitEncryptionEnabled == undefined
    ) {
      return false;
    }
    const rest = Stack.of(node).resolve(node.atRestEncryptionEnabled);
    const transit = Stack.of(node).resolve(node.transitEncryptionEnabled);
    if (rest == false || transit == false) {
      return false;
    }
  }

  return true;
}

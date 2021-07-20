/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * RDS instances and Aurora clusters have storage encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    if (node.storageEncrypted == undefined) {
      return false;
    }
    const encrypted = Stack.of(node).resolve(node.storageEncrypted);
    if (encrypted == false) {
      return false;
    }
    return true;
  } else if (node instanceof CfnDBInstance) {
    const encrypted = Stack.of(node).resolve(node.storageEncrypted);
    if (
      (encrypted == false || encrypted == undefined) &&
      (node.engine == undefined ||
        !node.engine.toLowerCase().includes('aurora'))
    ) {
      return false;
    }
    return true;
  }
  return true;
}

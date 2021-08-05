/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnReplicationInstance } from '@aws-cdk/aws-dms';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * DMS replication instances are not public - (Control ID: AC-4)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnReplicationInstance) {
    const publicAccess = Stack.of(node).resolve(node.publiclyAccessible);
    if (publicAccess) {
      return false;
    }
  }
  return true;
}

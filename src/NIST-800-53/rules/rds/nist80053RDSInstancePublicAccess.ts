/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * RDS instances are not publicly accessible
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
   if (node instanceof CfnDBInstance) {
    const publicAccess = Stack.of(node).resolve(node.publiclyAccessible);
    if (
      (publicAccess)
    ) {
      return false;
    }
    return true;
  }
  return true;
}

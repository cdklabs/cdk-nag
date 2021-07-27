/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Redshift clusters do not allow public access
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const publicAccess = Stack.of(node).resolve(node.publiclyAccessible)
    if (publicAccess) {
      return false;
    }
  }
  return true;
}
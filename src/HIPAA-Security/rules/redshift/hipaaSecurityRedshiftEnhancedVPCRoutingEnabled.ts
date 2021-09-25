/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Redshift clusters have enhanced VPC routing enabled - (Control IDs: 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const enhancedVpcRouting = Stack.of(node).resolve(node.enhancedVpcRouting);
    if (enhancedVpcRouting !== true) {
      return false;
    }
  }
  return true;
}

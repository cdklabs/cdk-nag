/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Redshift clusters have encryption and audit logging enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const encrypted = Stack.of(node).resolve(node.encrypted);
    const loggingProperties = Stack.of(node).resolve(node.loggingProperties);
    if (!encrypted  || loggingProperties == undefined) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Redshift clusters have encryption and audit logging enabled - (Control IDs: 3.4, 8.2.1, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const encrypted = resolveIfPrimitive(node, node.encrypted);
    const loggingProperties = Stack.of(node).resolve(node.loggingProperties);
    if (!encrypted || loggingProperties == undefined) {
      return false;
    }
  }
  return true;
}

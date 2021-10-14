/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-dax';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * DAX clusters have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    if (node.sseSpecification == undefined) {
      return false;
    }
    const sseSpecification = Stack.of(node).resolve(node.sseSpecification);
    const enabled = resolveIfPrimitive(node, sseSpecification.sseEnabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}

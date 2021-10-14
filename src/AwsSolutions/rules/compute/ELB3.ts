/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * CLBs have connection draining enabled.
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    if (node.connectionDrainingPolicy == undefined) {
      return false;
    }
    const draining = Stack.of(node).resolve(node.connectionDrainingPolicy);
    const resolvedDraining = Stack.of(node).resolve(draining);
    const enabled = resolveIfPrimitive(node, resolvedDraining.enabled);
    if (enabled !== true) {
      return false;
    }
  }
  return true;
}

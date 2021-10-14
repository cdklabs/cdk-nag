/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * CLBs have access logs enabled.
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    if (node.accessLoggingPolicy == undefined) {
      return false;
    }
    const accessLoggingPolicy = Stack.of(node).resolve(
      node.accessLoggingPolicy
    );
    const enabled = resolveIfPrimitive(node, accessLoggingPolicy.enabled);

    if (enabled == false) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * CLBs have connection draining enabled.
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    if (node.connectionDrainingPolicy == undefined) {
      return false;
    }
    const draining = Stack.of(node).resolve(node.connectionDrainingPolicy);
    const resolvedDraining = Stack.of(node).resolve(draining);
    if (!(resolvedDraining.enabled == true)) {
      return false;
    }
  }
  return true;
}

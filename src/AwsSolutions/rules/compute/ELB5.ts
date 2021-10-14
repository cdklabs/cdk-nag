/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * ELB listeners should be configured for secure (HTTPs or SSL) protocols for client communication.
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    const listeners = Stack.of(node).resolve(node.listeners);
    for (const listener of listeners) {
      const resolvedListener = Stack.of(node).resolve(listener);
      const protocol = resolveIfPrimitive(node, resolvedListener.protocol);
      const instanceProtocol = resolveIfPrimitive(
        node,
        resolvedListener.instanceProtocol
      );
      if (protocol.toLowerCase() == 'ssl') {
        if (
          !(
            instanceProtocol == undefined ||
            instanceProtocol.toLowerCase() == 'ssl'
          )
        ) {
          return false;
        }
      } else if (protocol.toLowerCase() == 'https') {
        if (
          !(
            instanceProtocol == undefined ||
            instanceProtocol.toLowerCase() == 'https'
          )
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

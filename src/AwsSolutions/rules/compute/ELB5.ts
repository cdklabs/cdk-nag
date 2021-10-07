/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * ELB listeners should be configured for secure (HTTPs or SSL) protocols for client communication.
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    const listeners = Stack.of(node).resolve(node.listeners);
    for (const listener of listeners) {
      const resolvedListener = Stack.of(node).resolve(listener);
      if (resolvedListener.protocol.toLowerCase() == 'ssl') {
        if (
          !(
            resolvedListener.instanceProtocol == undefined ||
            resolvedListener.instanceProtocol.toLowerCase() == 'ssl'
          )
        ) {
          return false;
        }
      } else if (resolvedListener.protocol.toLowerCase() == 'https') {
        if (
          !(
            resolvedListener.instanceProtocol == undefined ||
            resolvedListener.instanceProtocol.toLowerCase() == 'https'
          )
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

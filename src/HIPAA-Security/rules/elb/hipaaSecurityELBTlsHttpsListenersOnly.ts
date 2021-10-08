/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication - (Control IDs: AC-4, AC-4(22), AC-17(2), AC-24(1), AU-9(3), CA-9b, IA-5(1)(c), PM-17b, PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1a.2, SI-1a.2, SI-1c.2, SI-1c.2)
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

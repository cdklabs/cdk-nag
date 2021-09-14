/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
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

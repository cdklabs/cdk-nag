/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ELBs are not used for incoming HTTP/HTTPS traffic. Use ALBs instead.
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    const listeners = Stack.of(node).resolve(node.listeners);
    for (const listener of listeners) {
      const resolvedListener = Stack.of(node).resolve(listener);
      if (
        resolvedListener.protocol.toLowerCase() == 'http' ||
        resolvedListener.protocol.toLowerCase() == 'https'
      ) {
        return false;
      }
    }
  }
  return true;
}

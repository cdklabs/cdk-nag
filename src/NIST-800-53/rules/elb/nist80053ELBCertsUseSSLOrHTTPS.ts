/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ELBs utilize secure ACM-managed certificates - (Control IDs: SC-13, SC-28)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {

  if (node instanceof CfnLoadBalancer) {
    //For each listener, ensure that it's utilizing an ACM SSL/HTTPS cert
    const listeners = Stack.of(node).resolve(node.listeners);
    if (listeners != undefined) {
      //Iterate through listeners, checking if secured ACM certs are used
      for (const listener of listeners) {
        const listenerProtocol = listener.procol;
        if (listenerProtocol != 'HTTPS' && listenerProtocol != 'SSL') {
          return false;
        }
      }
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * CLBs use ACM-managed certificates - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    //For each listener, ensure that it's utilizing an ACM SSL/HTTPS cert
    const listeners = Stack.of(node).resolve(node.listeners);
    if (listeners != undefined) {
      //Iterate through listeners, checking if secured ACM certs are used
      for (const listener of listeners) {
        const resolvedListener = Stack.of(node).resolve(listener);
        const listenerARN = resolveIfPrimitive(
          node,
          resolvedListener.sslCertificateId
        );
        //Use the ARN to check if this is an ACM managed cert
        if (listenerARN == undefined) {
          return false;
        } else {
          const acmRegex = /^arn:[^:]+:acm:.+$/;
          if (!acmRegex.test(listenerARN)) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

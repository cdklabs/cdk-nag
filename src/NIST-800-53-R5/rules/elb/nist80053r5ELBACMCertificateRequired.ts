/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * CLBs use ACM-managed certificates - (Control IDs: AC-4, AC-4(22), AC-17(2), AC-24(1), AU-9(3), CA-9b, IA-5(1)(c), PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SC-23(5), SI-1a.2, SI-1a.2, SI-1c.2)
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

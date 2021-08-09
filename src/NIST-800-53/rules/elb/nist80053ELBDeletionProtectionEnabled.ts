/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ELBs have deletion protection enabled - (Control IDs: CM-2, CP-10)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
    if (attributes != undefined) {
      var deletionProtectionEnabled = false;
      for (const attr of attributes) {
        const resolvedAttr = Stack.of(node).resolve(attr);
        if (resolvedAttr.key != undefined && resolvedAttr.key == 'deletion_protection.enabled') {
          if (resolvedAttr.value == 'true') {
            deletionProtectionEnabled = true;
          }
        }
      }
      if (!deletionProtectionEnabled) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

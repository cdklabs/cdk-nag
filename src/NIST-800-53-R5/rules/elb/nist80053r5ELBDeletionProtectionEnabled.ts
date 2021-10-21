/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * ALBs, NLBs, and GLBs have deletion protection enabled - (Control IDs: CA-7(4)(c), CM-2a, CM-2(2), CM-3a, CM-8(6), CP-1a.1(b), CP-1a.2, CP-2a, CP-2a.6, CP-2a.7, CP-2d, CP-2e, CP-2(5), SA-15a.4, SC-5(2), SC-22)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
    if (attributes != undefined) {
      var deletionProtectionEnabled = false;
      for (const attr of attributes) {
        const resolvedAttr = Stack.of(node).resolve(attr);
        if (
          resolvedAttr.key != undefined &&
          resolvedAttr.key == 'deletion_protection.enabled'
        ) {
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

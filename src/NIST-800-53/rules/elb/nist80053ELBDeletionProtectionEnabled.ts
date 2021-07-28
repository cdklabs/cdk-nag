/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ELBs have deletion protection enabled - (Control IDs: SC-5, CP-10)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
    if (attributes != undefined) {
      if ('deletion_protection.enabled' in attributes) {
        if (attributes['deletion_protection.enabled'] != true) {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

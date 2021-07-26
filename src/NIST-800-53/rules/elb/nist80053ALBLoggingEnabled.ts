/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Application Load Balancers have logging enabled - (Control IDs: AU-2(a)(d), AU-3, AU-12(a)(c)).
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {

    const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
    const reg = /"access_logs\.s3\.enabled","value":"true"/gm;

    if (JSON.stringify(attributes).search(reg) == -1) {
      return false;
    }

  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ALBs have access logs enabled.
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
    for (const attribute of attributes) {
      const resolvedAttribute = Stack.of(node).resolve(attribute);
      if (
        resolvedAttribute.key == 'access_logs.s3.enabled' ||
        resolvedAttribute.value == 'true'
      ) {
        return true;
      }
    }
    return false;
  }
  return true;
}

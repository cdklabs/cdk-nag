/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * ALBs have access logs enabled.
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    const type = resolveIfPrimitive(node, node.type);
    if (type == undefined || type == 'application') {
      const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
      let found = false;
      for (const attribute of attributes) {
        const resolvedAttribute = Stack.of(node).resolve(attribute);
        const key = resolveIfPrimitive(node, resolvedAttribute.key);
        const value = resolveIfPrimitive(node, resolvedAttribute.value);
        if (key == 'access_logs.s3.enabled' && value == 'true') {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
  }
  return true;
}

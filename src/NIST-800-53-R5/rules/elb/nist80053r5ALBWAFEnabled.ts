/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { CfnWebACLAssociation } from '@aws-cdk/aws-wafv2';
import { CfnResource, Stack } from '@aws-cdk/core';
import {
  resolveIfPrimitive,
  resolveResourceFromInstrinsic,
} from '../../../nag-pack';

/**
 * ALBs are associated with AWS WAFv2 web ACLs - (Control ID: AC-4(21))
 * @param node the CfnResource to check
 */

export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    const type = resolveIfPrimitive(node, node.type);
    if (type === undefined || type === 'application') {
      const loadBalancerLogicalId = resolveResourceFromInstrinsic(
        node,
        node.ref
      );
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnWebACLAssociation) {
          if (isMatchingWebACLAssociation(child, loadBalancerLogicalId)) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Helper function to check whether a given Web ACL Association is associated with the given Load Balancer
 * @param node the CfnWebACLAssociation to check
 * @param loadBalancerLogicalId the Cfn Logical ID of the Load Balancer
 * returns whether the CfnWebACLAssociation is associates with the given Load Balancer
 */
function isMatchingWebACLAssociation(
  node: CfnWebACLAssociation,
  loadBalancerLogicalId: string
): boolean {
  const resourceLogicalId = JSON.stringify(
    Stack.of(node).resolve(node.resourceArn)
  );
  if (
    new RegExp(`${loadBalancerLogicalId}(?![\\w])`, 'gm').test(
      resourceLogicalId
    )
  ) {
    return true;
  }
  return false;
}

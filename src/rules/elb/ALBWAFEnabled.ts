/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { CfnWebACLAssociation } from '@aws-cdk/aws-wafv2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * ALBs are associated with AWS WAFv2 web ACLs
 * @param node the CfnResource to check
 */

export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      const type = NagRules.resolveIfPrimitive(node, node.type);
      if (type === undefined || type === 'application') {
        const loadBalancerLogicalId = NagRules.resolveResourceFromInstrinsic(
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
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

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

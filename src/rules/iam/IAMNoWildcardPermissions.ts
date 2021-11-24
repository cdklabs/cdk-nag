/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import {
  CfnRole,
  CfnUser,
  CfnGroup,
  CfnPolicy,
  CfnManagedPolicy,
} from '@aws-cdk/aws-iam';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * IAM entities with wildcard permissions have a cdk_nag rule suppression with evidence for those permission
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (
      node instanceof CfnGroup ||
      node instanceof CfnUser ||
      node instanceof CfnRole
    ) {
      const inlinePolicies = Stack.of(node).resolve(node.policies);
      if (inlinePolicies != undefined) {
        for (const policy of inlinePolicies) {
          const resolvedPolicy = Stack.of(node).resolve(policy);
          const resolvedPolicyDocument = Stack.of(node).resolve(
            resolvedPolicy.policyDocument
          );
          if (JSON.stringify(resolvedPolicyDocument).includes('*')) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnPolicy || node instanceof CfnManagedPolicy) {
      const policyDocument = Stack.of(node).resolve(node.policyDocument);
      if (JSON.stringify(policyDocument).includes('*')) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

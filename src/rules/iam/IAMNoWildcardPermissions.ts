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
import {
  NagRuleResult,
  NagRuleCompliance,
  NagRuleFindings,
  NagRuleFinding,
} from '../../nag-rules';
import { flattenCfnReference } from '../../utils/flatten-cfn-reference';

interface IAMPolicyDocument {
  Statement?: IAMPolicyStatement[];
}

interface IAMPolicyStatement {
  Action: string | string[];
  Effect: 'Allow' | 'Deny';
  Resource: unknown;
}

/**
 * IAM entities with wildcard permissions have a cdk_nag rule suppression with evidence for those permission
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (
      node instanceof CfnGroup ||
      node instanceof CfnUser ||
      node instanceof CfnRole
    ) {
      const inlinePolicies = Stack.of(node).resolve(node.policies);
      const findings = new Set<NagRuleFinding>();
      if (inlinePolicies != undefined) {
        for (const policy of inlinePolicies) {
          const resolvedPolicy = Stack.of(node).resolve(policy);
          const resolvedPolicyDocument: IAMPolicyDocument = Stack.of(
            node
          ).resolve(resolvedPolicy.policyDocument);

          analyzePolicy(resolvedPolicyDocument).forEach((finding) =>
            findings.add(finding)
          );
        }
      }
      return findings.size ? [...findings] : NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnPolicy || node instanceof CfnManagedPolicy) {
      const policyDocument = Stack.of(node).resolve(node.policyDocument);

      const findings = analyzePolicy(policyDocument);
      return findings.length ? findings : NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

const analyzePolicy = (policy: IAMPolicyDocument): NagRuleFindings => {
  const result = new Set<NagRuleFinding>();

  for (const statement of policy.Statement ?? []) {
    // we don't report on denys
    if (statement.Effect === 'Allow') {
      const actions = normalizeArray(statement.Action);
      actions
        .filter((action) => action.includes('*'))
        .map((action) => `Action::${action}`)
        .forEach((action) => result.add(action));
      const resources = normalizeArray(statement.Resource);
      resources
        .map(flattenCfnReference)
        .filter((resource) => resource.includes('*'))
        .map((resource) => `Resource::${resource}`)
        .forEach((resource) => result.add(resource));
    }
  }
  return [...result];
};

const normalizeArray = <T>(arrOrStr: T[] | T): T[] =>
  Array.isArray(arrOrStr) ? arrOrStr : [arrOrStr];

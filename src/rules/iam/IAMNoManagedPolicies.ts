/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRole, CfnUser, CfnGroup } from 'aws-cdk-lib/aws-iam';
import {
  NagRuleCompliance,
  NagRuleFinding,
  NagRuleResult,
} from '../../nag-rules';
import { flattenCfnReference } from '../../utils/flatten-cfn-reference';

/**
 * IAM users, roles, and groups do not use AWS managed policies
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (
      node instanceof CfnGroup ||
      node instanceof CfnUser ||
      node instanceof CfnRole
    ) {
      const managedPolicyArns = <string[]>(
        Stack.of(node).resolve(node.managedPolicyArns)
      );
      const findings = new Set<NagRuleFinding>();
      if (managedPolicyArns !== undefined) {
        managedPolicyArns
          .map((policy) => flattenCfnReference(Stack.of(node).resolve(policy)))
          .filter((policy) => policy.includes(':iam::aws:'))
          .forEach((policy) => findings.add(`Policy::${policy}`));
      }
      return findings.size ? [...findings] : NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRole, CfnUser, CfnGroup } from 'aws-cdk-lib/aws-iam';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * IAM users, roles, and groups do not use AWS managed policies
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (
      node instanceof CfnGroup ||
      node instanceof CfnUser ||
      node instanceof CfnRole
    ) {
      const managedPolicyArns = Stack.of(node).resolve(node.managedPolicyArns);
      if (managedPolicyArns != undefined) {
        for (const arn of managedPolicyArns) {
          const resolvedArn = Stack.of(node).resolve(arn);
          const arnPrefix = JSON.stringify(resolvedArn).split('/', 1)[0];
          if (
            !(/\d{12}/.test(arnPrefix) || arnPrefix.includes('AWS::AccountId'))
          ) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
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

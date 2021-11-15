/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnRegistryPolicy, CfnRepository } from '@aws-cdk/aws-ecr';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * ECR Repositories do not allow open access
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnRegistryPolicy) {
      const policyText = Stack.of(node).resolve(node.policyText);
      return checkStatement(policyText);
    } else if (node instanceof CfnRepository) {
      const policyText = Stack.of(node).resolve(node.repositoryPolicyText);
      return checkStatement(policyText);
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/**
 * Helper function for parsing through the policy statement
 * @param policyText the JSON policy text
 * @returns boolean
 */
function checkStatement(policyText: any): boolean {
  if (policyText == undefined || policyText.Statement == undefined) {
    return true;
  }
  for (const statement of policyText.Statement) {
    const effect = statement.Effect;
    if (effect == 'Allow') {
      const awsString = statement.Principal
        ? JSON.stringify(statement.Principal)
        : '';
      if (awsString.includes('*')) {
        return false;
      }
    }
  }
  return true;
}

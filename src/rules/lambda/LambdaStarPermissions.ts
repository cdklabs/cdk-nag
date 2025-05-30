/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRole } from 'aws-cdk-lib/aws-iam';
import { NagRuleCompliance } from '../../nag-rules';

interface IAMPolicyDocument {
  Statement?: IAMPolicyStatement[];
}

interface IAMPolicyStatement {
  Action: string | string[];
  Effect: 'Allow' | 'Deny';
  Resource: unknown;
}

/**
 * Lambda functions have least privileged access permissions.
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    // Only check IAM roles
    if (!(node instanceof CfnRole)) {
      return NagRuleCompliance.NOT_APPLICABLE;
    }

    // Check if this is a Lambda role
    if (!isLambdaRole(node)) {
      return NagRuleCompliance.NOT_APPLICABLE;
    }

    // Check if the role has any policies with wildcard permissions
    const inlinePolicies = Stack.of(node).resolve(node.policies);

    if (inlinePolicies && inlinePolicies.length > 0) {
      for (const policy of inlinePolicies) {
        const resolvedPolicy = Stack.of(node).resolve(policy);
        const policyDocument: IAMPolicyDocument = Stack.of(node).resolve(
          resolvedPolicy.policyDocument
        );

        if (policyDocument.Statement) {
          for (const statement of policyDocument.Statement) {
            if (statementContainsWildcard(statement)) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
          }
        }
      }
    }

    // If we've checked all policies and found no wildcards, the role is compliant
    return NagRuleCompliance.COMPLIANT;
  },
  'name',
  { value: parse(__filename).name }
);

/**
 * Checks if a role is assumed by the Lambda service
 * @param node The CfnRole to check
 * @returns true if the role is assumed by Lambda service
 */
function isLambdaRole(node: CfnRole): boolean {
  const assumeRolePolicyDocument = Stack.of(node).resolve(
    node.assumeRolePolicyDocument
  );

  if (!assumeRolePolicyDocument || !assumeRolePolicyDocument.Statement) {
    return false;
  }

  for (const statement of assumeRolePolicyDocument.Statement) {
    if (statement.Principal && statement.Principal.Service) {
      const service = Array.isArray(statement.Principal.Service)
        ? statement.Principal.Service
        : [statement.Principal.Service];

      if (service.includes('lambda.amazonaws.com')) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a policy statement contains wildcard permissions
 * @param statement The policy statement to check
 * @returns true if the statement contains wildcard permissions
 */
function statementContainsWildcard(statement: IAMPolicyStatement): boolean {
  // Only check Allow statements
  if (statement.Effect !== 'Allow') {
    return false;
  }

  // Check for wildcard in actions
  const actions = normalizeToArray(statement.Action);
  for (const action of actions) {
    if (typeof action === 'string') {
      // Check for full wildcard ('*')
      if (action === '*') {
        return true;
      }

      // Check for service level wildcard (e.g., 's3:*')
      // But allow service specific partial actions (e.g., 's3:Get*')
      if (action.endsWith(':*')) {
        return true;
      }
    }
  }

  // Check for full wildcard in resources
  // Only flag resources that are exactly '*'
  const resources = normalizeToArray(statement.Resource);
  for (const resource of resources) {
    if (typeof resource === 'string' && resource === '*') {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes a value to an array
 * @param value The value to normalize
 * @returns An array containing the value(s)
 */
function normalizeToArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

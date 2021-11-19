/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnPolicy, CfnManagedPolicy, CfnUser } from 'aws-cdk-lib/aws-iam';
/**
 * IAM policies are not attached at the user level
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnPolicy || node instanceof CfnManagedPolicy) {
      const policyUsers = Stack.of(node).resolve(node.users);
      if (policyUsers != undefined) {
        return false;
      }
    } else if (node instanceof CfnUser) {
      const policies = Stack.of(node).resolve(node.policies);
      const managedPolicyArns = Stack.of(node).resolve(node.managedPolicyArns);
      if (policies != undefined || managedPolicyArns != undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

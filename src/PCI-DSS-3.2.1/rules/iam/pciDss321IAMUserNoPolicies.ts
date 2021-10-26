/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnPolicy, CfnManagedPolicy, CfnUser } from '@aws-cdk/aws-iam';
import { CfnResource, Stack } from '@aws-cdk/core';
/**
 * IAM policies are not attached at the user level - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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
}

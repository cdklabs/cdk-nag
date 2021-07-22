/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnPolicy, CfnManagedPolicy } from '@aws-cdk/aws-iam';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * IAM policies are not attached at the user level - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if ( node instanceof CfnPolicy || node instanceof CfnManagedPolicy) {
    const policyUsers = Stack.of(node).resolve(node.users);

    if (policyUsers != undefined) {
      return false;
    }
  }

  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  CfnRole,
  CfnUser,
  CfnGroup,
  CfnPolicy,
} from '@aws-cdk/aws-iam';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * IAM Users do not contain inline policies - (Control ID: AC-6)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (
    node instanceof CfnGroup ||
    node instanceof CfnUser ||
    node instanceof CfnRole
  ) {
    const inlinePolicies = Stack.of(node).resolve(node.policies);
    if (inlinePolicies != undefined) {
      return false;
    }
  }
  if (node instanceof CfnPolicy) {
    return false;
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnUser } from '@aws-cdk/aws-iam';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * IAM users are assigned to at least one group - (Control IDs: AC-2(1), AC-2(j), AC-3, AC-6)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnUser) {
    const userGroup = Stack.of(node).resolve(node.groups);

    if (userGroup == undefined) {
      return false;
    }
  }
  return true;
}

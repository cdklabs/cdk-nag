/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnUser } from '@aws-cdk/aws-iam';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * IAM users are assigned to at least one group - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnUser) {
    const userGroup = Stack.of(node).resolve(node.groups);
    if (userGroup == undefined) {
      return false;
    }
  }
  return true;
}

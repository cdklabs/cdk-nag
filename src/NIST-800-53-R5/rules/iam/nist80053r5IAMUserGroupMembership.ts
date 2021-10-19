/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnUser } from '@aws-cdk/aws-iam';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * IAM users are assigned to at least one group - (Control IDs: AC-2i.2, AC-2(1), AC-2(6), AC-3, AC-3(3)(a), AC-3(3)(b)(1), AC-3(3)(b)(2), AC-3(3)(b)(3), AC-3(3)(b)(4), AC-3(3)(b)(5), AC-3(3)(c), AC-3(3), AC-3(4)(a), AC-3(4)(b), AC-3(4)(c), AC-3(4)(d), AC-3(4)(e), AC-3(4), AC-3(7), AC-3(8), AC-3(12)(a), AC-3(13), AC-3(15)(a), AC-3(15)(b), AC-4(28), AC-6, AC-6(3), AC-24, CM-5(1)(a), CM-6a, CM-9b, MP-2, SC-23(3))
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnRole, CfnUser, CfnGroup, CfnPolicy } from '@aws-cdk/aws-iam';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * IAM Groups, Users, and Roles do not contain inline policies - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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

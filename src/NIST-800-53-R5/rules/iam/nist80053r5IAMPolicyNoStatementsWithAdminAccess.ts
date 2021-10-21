/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  CfnPolicy,
  CfnManagedPolicy,
  PolicyDocument,
  CfnGroup,
  CfnRole,
} from '@aws-cdk/aws-iam';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * IAM policies do not grant admin access - (Control IDs: AC-2i.2, AC-2(1), AC-2(6), AC-3, AC-3(3)(a), AC-3(3)(b)(1), AC-3(3)(b)(2), AC-3(3)(b)(3), AC-3(3)(b)(4), AC-3(3)(b)(5), AC-3(3)(c), AC-3(3), AC-3(4)(a), AC-3(4)(b), AC-3(4)(c), AC-3(4)(d), AC-3(4)(e), AC-3(4), AC-3(7), AC-3(8), AC-3(12)(a), AC-3(13), AC-3(15)(a), AC-3(15)(b), AC-4(28), AC-5b, AC-6, AC-6(2), AC-6(3), AC-6(10), AC-24, CM-5(1)(a), CM-6a, CM-9b, MP-2, SC-23(3), SC-25)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnPolicy || node instanceof CfnManagedPolicy) {
    if (checkDocument(node, node.policyDocument)) {
      return false;
    }
  } else if (node instanceof CfnGroup || node instanceof CfnRole) {
    if (node.policies != undefined && checkDocument(node, node.policies)) {
      return false;
    }
  }
  return true;
}

/**
 * Helper function for parsing through the policy document
 * @param node the CfnResource to Check
 * @param policyDoc the JSON policy document
 * @returns boolean
 */
function checkDocument(node: CfnResource, policyDoc: any): boolean {
  const resolvedDoc = Stack.of(node).resolve(policyDoc) as PolicyDocument;
  const reg =
    /"Action":\[?(.*,)?"\*"(,.*)?\]?,"Effect":"Allow","Resource":\[?(.*,)?"(?:arn(?::.*(?::)?)?)?\*"(,.*)?\]?/gm;
  if (JSON.stringify(resolvedDoc).search(reg) != -1) {
    return true;
  }
  return false;
}

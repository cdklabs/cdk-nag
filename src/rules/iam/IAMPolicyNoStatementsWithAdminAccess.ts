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
 * IAM policies do not grant admin access
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudTrail trails have encryption enabled - (Control IDs: 2.2, 3.4, 10.5)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnTrail) {
    const keyID = Stack.of(node).resolve(node.kmsKeyId);
    if (keyID == undefined) {
      return false;
    }
  }
  return true;
}

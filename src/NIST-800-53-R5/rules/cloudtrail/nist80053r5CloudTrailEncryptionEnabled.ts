/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudTrail trails have encryption enabled - (Control IDs: AU-9(3), CM-6a, CM-9b, CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))
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

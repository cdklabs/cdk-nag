/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 *  RDS instances have multi-AZ support - (Control IDs: CP-10, SC-5, SC-36)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const multiAz = Stack.of(node).resolve(node.multiAz);
    if (!multiAz) {
      return false;
    }
  }
  return true;
}

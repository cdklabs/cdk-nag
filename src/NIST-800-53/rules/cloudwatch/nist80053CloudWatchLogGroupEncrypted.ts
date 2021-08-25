/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLogGroup } from '@aws-cdk/aws-logs';
import { IConstruct } from '@aws-cdk/core';

/**
 * CloudWatch Log Groups are encrypted with KMS Customer Master Keys (CMK) - (Control IDs: AU-9, SC-13, SC-28)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLogGroup) {
    if (node.kmsKeyId == undefined) {
      return false;
    }
  }
  return true;
}

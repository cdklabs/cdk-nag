/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLogGroup } from '@aws-cdk/aws-logs';
import { CfnResource } from '@aws-cdk/core';

/**
 * CloudWatch Log Groups are encrypted with customer managed keys - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4)))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLogGroup) {
    if (node.kmsKeyId == undefined) {
      return false;
    }
  }
  return true;
}

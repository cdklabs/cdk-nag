/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLogGroup } from '@aws-cdk/aws-logs';
import { CfnResource } from '@aws-cdk/core';

/**
 * CloudWatch Log Groups have an explicit retention period configured - (Control ID: AC-16b, AT-4b, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-10, AU-11(1), AU-11, AU-12(1), AU-12(2), AU-12(3), AU-14a, AU-14b, CA-7b, PM-14a.1, PM-14b, PM-21b, PM-31, SC-28(2), SI-4(17), SI-12)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLogGroup) {
    if (node.retentionInDays == undefined) {
      return false;
    }
  }
  return true;
}

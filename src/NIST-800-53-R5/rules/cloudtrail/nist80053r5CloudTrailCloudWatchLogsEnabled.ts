/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudTrail trails have CloudWatch logs enabled - (Control IDs: AC-2(4), AC-3(1), AC-3(10), AC-4(26), AC-6(9), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-4(1), AU-6(1), AU-6(3), AU-6(4), AU-6(5), AU-6(6), AU-6(9), AU-7(1), AU-8b, AU-9(7), AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), AU-16, CA-7b, CM-5(1)(b), CM-6a, CM-9b, IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-1(1)(c), SI-3(8)(b), SI-4(2), SI-4(17), SI-4(20), SI-7(8), SI-10(1)(c))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnTrail) {
    const cloudWatch = Stack.of(node).resolve(node.cloudWatchLogsLogGroupArn);

    if (cloudWatch == undefined) {
      return false;
    }
  }
  return true;
}

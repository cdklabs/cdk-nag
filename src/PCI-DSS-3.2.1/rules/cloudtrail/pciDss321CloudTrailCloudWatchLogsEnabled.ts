/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudTrail trails have CloudWatch logs enabled - (Control IDs: 2.2, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.3, 10.5.4)
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

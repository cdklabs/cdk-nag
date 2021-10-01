/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudTrail trails have CloudWatch logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b))
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

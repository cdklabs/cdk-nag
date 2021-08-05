/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * The Cloud Trail resources have Cloud Watch logs enabled - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-6(1)(3), AU-7(1), AU-12(a)(c), CA-7(a)(b), SI-4(2), SI-4(4), SI-4(5), SI-4(a)(b)(c))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnTrail) {
    const cloudWatch = Stack.of(node).resolve(node.cloudWatchLogsLogGroupArn);

    if (cloudWatch == undefined) {
      return false;
    }
  }
  return true;
}

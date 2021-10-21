/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Lambda functions are configured with a dead-letter configuration - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-36(1)(a), SI-2a)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnFunction) {
    const deadLetterConfig = Stack.of(node).resolve(node.deadLetterConfig);
    if (
      deadLetterConfig == undefined ||
      deadLetterConfig.targetArn == undefined
    ) {
      return false;
    }
  }
  return true;
}

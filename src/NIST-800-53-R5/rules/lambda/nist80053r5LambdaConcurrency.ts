/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Lambda functions are configured with function-level concurrent execution limits - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-6)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnFunction) {
    const reservedConcurrentExecutions = resolveIfPrimitive(
      node,
      node.reservedConcurrentExecutions
    );
    if (
      reservedConcurrentExecutions == undefined ||
      reservedConcurrentExecutions === 0
    ) {
      return false;
    }
  }
  return true;
}

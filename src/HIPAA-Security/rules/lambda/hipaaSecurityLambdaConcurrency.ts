/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Lambda functions are configured with function-level concurrent execution limits - (Control ID: 164.312(b))
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

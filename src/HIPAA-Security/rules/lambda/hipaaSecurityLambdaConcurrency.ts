/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Lambda functions are configured with function-level concurrent execution limits - (Control ID: 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnFunction) {
    const reservedConcurrentExecutions = Stack.of(node).resolve(
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

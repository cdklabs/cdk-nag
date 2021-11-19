/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Lambda functions are configured with function-level concurrent execution limits
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);

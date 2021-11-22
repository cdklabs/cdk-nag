/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * Lambda functions are configured with function-level concurrent execution limits
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFunction) {
      const reservedConcurrentExecutions = resolveIfPrimitive(
        node,
        node.reservedConcurrentExecutions
      );
      if (
        reservedConcurrentExecutions == undefined ||
        reservedConcurrentExecutions === 0
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

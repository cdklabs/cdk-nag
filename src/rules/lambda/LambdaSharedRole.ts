/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnFunction } from '@aws-cdk/aws-lambda';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Lambda functions do not share roles
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFunction) {
      const stack = Stack.of(node);

      const otherFunctions = stack.node
        .findAll()
        .filter(
          (res) => res !== node && res instanceof CfnFunction
        ) as CfnFunction[];

      const role = JSON.stringify(stack.resolve(node.role));
      const duplicateRole = otherFunctions.find(
        (res) => JSON.stringify(stack.resolve(res.role)) === role
      );

      if (duplicateRole) {
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

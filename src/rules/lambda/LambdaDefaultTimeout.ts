/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Ensure that Lambda functions have an explicit timeout value
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFunction) {
      const timeout = Stack.of(node).resolve(node.timeout);
      if (timeout) return NagRuleCompliance.COMPLIANT;
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);

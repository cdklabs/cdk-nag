/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEventInvokeConfig } from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Lambda functions with asynchronous invocations should have a failure destination
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnEventInvokeConfig) {
      const destinationConfig = Stack.of(node).resolve(node.destinationConfig);
      if (destinationConfig?.onFailure?.destination)
        return NagRuleCompliance.COMPLIANT;
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);

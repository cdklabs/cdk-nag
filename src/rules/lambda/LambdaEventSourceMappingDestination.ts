/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEventSourceMapping } from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Lambda Event Source Mappings must have a destination configured for failed invocations.
 *
 * @param node - The CfnResource to check
 */
export default function LambdaEventSourceMappingDestination(
  node: CfnResource
): NagRuleCompliance {
  if (node instanceof CfnEventSourceMapping) {
    const destinationConfig = Stack.of(node).resolve(node.destinationConfig);
    if (
      destinationConfig?.onFailure &&
      destinationConfig?.onFailure?.destination
    ) {
      return NagRuleCompliance.COMPLIANT;
    }
    return NagRuleCompliance.NON_COMPLIANT;
  }
  return NagRuleCompliance.NOT_APPLICABLE;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnAgent } from 'aws-cdk-lib/aws-bedrock';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Bedrock agents have a guardrail identifier and version configured
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnAgent) {
      const guardrail = Stack.of(node).resolve(node.guardrailConfiguration);
      const identifier = Stack.of(node).resolve(guardrail?.guardrailIdentifier);
      const version = Stack.of(node).resolve(guardrail?.guardrailVersion);
      if (
        identifier == undefined ||
        identifier === '' ||
        identifier.Ref === 'AWS::NoValue' ||
        version == undefined ||
        version === '' ||
        version.Ref === 'AWS::NoValue'
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

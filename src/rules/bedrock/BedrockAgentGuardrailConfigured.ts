/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnAgent } from 'aws-cdk-lib/aws-bedrock';
import { isConfigured } from './is-configured';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Bedrock agents have a guardrail identifier and version configured
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnAgent) {
      const guardrail = Stack.of(node).resolve(node.guardrailConfiguration);
      if (
        !isConfigured(guardrail, ['guardrailIdentifier']) ||
        !isConfigured(guardrail, ['guardrailVersion'])
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

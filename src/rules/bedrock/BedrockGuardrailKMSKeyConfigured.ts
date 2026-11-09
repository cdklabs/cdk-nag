/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnGuardrail } from 'aws-cdk-lib/aws-bedrock';
import { isConfigured } from './is-configured';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Bedrock guardrails use customer managed KMS keys
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnGuardrail) {
      const kmsKey = Stack.of(node).resolve(node.kmsKeyArn);
      if (!isConfigured(kmsKey)) {
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

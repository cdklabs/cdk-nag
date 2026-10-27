/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnMemory } from 'aws-cdk-lib/aws-bedrockagentcore';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Bedrock AgentCore memories are encrypted with a customer managed KMS key
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnMemory) {
      const kmsKey = Stack.of(node).resolve(node.encryptionKeyArn);
      if (!kmsKey) {
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

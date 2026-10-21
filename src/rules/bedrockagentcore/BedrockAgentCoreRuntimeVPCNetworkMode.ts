/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRuntime } from 'aws-cdk-lib/aws-bedrockagentcore';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Bedrock AgentCore runtimes are configured with VPC network mode
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnRuntime) {
      const networkConfiguration = Stack.of(node).resolve(
        node.networkConfiguration
      );
      const networkMode = NagRules.resolveIfPrimitive(
        node,
        networkConfiguration?.networkMode
      );
      if (networkMode !== 'VPC') {
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

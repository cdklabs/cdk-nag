/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnCodeInterpreterCustom } from 'aws-cdk-lib/aws-bedrockagentcore';
import { resolveNetworkMode } from './utils';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Bedrock AgentCore custom code interpreters are configured with VPC network mode
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCodeInterpreterCustom) {
      const networkMode = resolveNetworkMode(node, node.networkConfiguration);
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

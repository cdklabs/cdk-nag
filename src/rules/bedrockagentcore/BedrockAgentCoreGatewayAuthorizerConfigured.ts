/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnGateway } from 'aws-cdk-lib/aws-bedrockagentcore';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Bedrock AgentCore gateways require authorization for inbound requests
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnGateway) {
      const authorizerType = NagRules.resolveIfPrimitive(
        node,
        node.authorizerType
      );
      if (authorizerType === 'NONE') {
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

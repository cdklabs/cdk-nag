/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnRuntime } from 'aws-cdk-lib/aws-bedrockagentcore';
import { NagRuleCompliance } from '../../nag-rules';
import { resolveNestedPrimitive } from '../../utils/resolve-nested-primitive';

/**
 * Bedrock AgentCore runtimes are not configured with PUBLIC network mode
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnRuntime) {
      const networkMode = resolveNestedPrimitive(
        node,
        node.networkConfiguration,
        'networkMode'
      );
      if (networkMode === 'PUBLIC') {
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

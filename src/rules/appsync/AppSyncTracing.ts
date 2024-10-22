/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnGraphQLApi } from 'aws-cdk-lib/aws-appsync';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Ensure that AppSync APIs have tracing enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnGraphQLApi) {
      const isXrayEnabled = Stack.of(node).resolve(node.xrayEnabled);
      if (isXrayEnabled) return NagRuleCompliance.COMPLIANT;
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);

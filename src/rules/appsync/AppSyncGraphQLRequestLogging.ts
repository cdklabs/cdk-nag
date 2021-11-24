/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnGraphQLApi } from '@aws-cdk/aws-appsync';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * GraphQL APIs have request leveling logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnGraphQLApi) {
      const logConfig = Stack.of(node).resolve(node.logConfig);
      if (logConfig === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const excludeVerboseContent = NagRules.resolveIfPrimitive(
        node,
        logConfig.excludeVerboseContent
      );
      if (
        logConfig.cloudWatchLogsRoleArn === undefined ||
        excludeVerboseContent === true
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

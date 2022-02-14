/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-ecs';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * ECS Task Definitions have awslogs logging enabled at the minimum
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      if (node.configuration == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const configuration = Stack.of(node).resolve(node.configuration);
      if (configuration.executeCommandConfiguration == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const executeCommandConfiguration = Stack.of(node).resolve(
        configuration.executeCommandConfiguration
      );
      if (
        executeCommandConfiguration.logging == undefined ||
        executeCommandConfiguration.logging == 'NONE'
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

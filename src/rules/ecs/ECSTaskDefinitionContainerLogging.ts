/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Containers in ECS Task Definitions have logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnTaskDefinition) {
      const containerDefinitions = Stack.of(node).resolve(
        node.containerDefinitions
      );
      if (containerDefinitions !== undefined) {
        for (const containerDefinition of containerDefinitions) {
          const resolvedDefinition =
            Stack.of(node).resolve(containerDefinition);
          const logConfiguration = Stack.of(node).resolve(
            resolvedDefinition.logConfiguration
          );
          if (logConfiguration?.logDriver === undefined) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

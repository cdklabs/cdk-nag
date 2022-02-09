/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnTaskDefinition } from '@aws-cdk/aws-ecs';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Containers in ECS task definitions do not directly specify environment variables
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
          const environment = Stack.of(node).resolve(
            resolvedDefinition.environment
          );
          if (environment !== undefined) {
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

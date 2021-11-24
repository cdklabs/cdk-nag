/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnTaskDefinition, NetworkMode } from '@aws-cdk/aws-ecs';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Containers in ECS task definitions configured for host networking have 'privileged' set to true and a non-empty non-root 'user'
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnTaskDefinition) {
      if (node.networkMode === NetworkMode.HOST) {
        const containerDefinitions = Stack.of(node).resolve(
          node.containerDefinitions
        );
        if (containerDefinitions !== undefined) {
          for (const containerDefinition of containerDefinitions) {
            const resolvedDefinition =
              Stack.of(node).resolve(containerDefinition);
            const privileged = NagRules.resolveIfPrimitive(
              node,
              resolvedDefinition.privileged
            );
            const user = NagRules.resolveIfPrimitive(
              node,
              resolvedDefinition.user
            );
            if (privileged !== true || user === undefined) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
            const rootIdentifiers = ['root', '0'];
            const userParts = user.split(':');
            for (const userPart of userParts) {
              if (rootIdentifiers.includes(userPart.toLowerCase())) {
                return NagRuleCompliance.NON_COMPLIANT;
              }
            }
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

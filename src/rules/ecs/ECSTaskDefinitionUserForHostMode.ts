/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTaskDefinition, NetworkMode } from '@aws-cdk/aws-ecs';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Containers in ECS task definitions configured for host networking have 'privileged' set to true and a non-empty non-root 'user'
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnTaskDefinition) {
    if (node.networkMode === NetworkMode.HOST) {
      const containerDefinitions = Stack.of(node).resolve(
        node.containerDefinitions
      );
      if (containerDefinitions !== undefined) {
        for (const containerDefinition of containerDefinitions) {
          const resolvedDefinition =
            Stack.of(node).resolve(containerDefinition);
          const privileged = resolveIfPrimitive(
            node,
            resolvedDefinition.privileged
          );
          const user = resolveIfPrimitive(node, resolvedDefinition.user);
          if (privileged !== true || user === undefined) {
            return false;
          }
          const rootIdentifiers = ['root', '0'];
          const userParts = user.split(':');
          for (const userPart of userParts) {
            if (rootIdentifiers.includes(userPart.toLowerCase())) {
              return false;
            }
          }
        }
      }
    }
  }
  return true;
}

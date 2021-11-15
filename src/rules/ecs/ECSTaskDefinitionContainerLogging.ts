/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-ecs';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * ECS Task Definition has awslogs logging enabled at the minimum
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      if (node.configuration == undefined) {
        return false;
      }
      const configuration = Stack.of(node).resolve(node.configuration);
      if (configuration.executeCommandConfiguration == undefined) {
        return false;
      }
      const executeCommandConfiguration = resolveIfPrimitive(
        node,
        configuration.executeCommandConfiguration
      );
      if (
        executeCommandConfiguration.logging == undefined ||
        executeCommandConfiguration.logging == 'NONE'
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

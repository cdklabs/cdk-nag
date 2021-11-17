/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-ecs';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * ECS Cluster has CloudWatch Container Insights Enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      if (node.clusterSettings == undefined) {
        return false;
      }
      const clusterSettings = Stack.of(node).resolve(node.clusterSettings);
      for (const setting of clusterSettings) {
        const resolvedSetting = Stack.of(node).resolve(setting);
        if (
          resolvedSetting.name &&
          resolvedSetting.name == 'containerInsights' &&
          resolvedSetting.value &&
          resolvedSetting.value == 'enabled'
        ) {
          return true;
        }
      }
      return false;
    }

    return true;
  },
  'name',
  { value: parse(__filename).name }
);

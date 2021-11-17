/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnContainer } from '@aws-cdk/aws-mediastore';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Media Store containers define metric policies to send metrics to CloudWatch
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnContainer) {
      const metricPolicy = Stack.of(node).resolve(node.metricPolicy);
      if (metricPolicy == undefined) {
        return false;
      }
      const containerLevelMetrics = resolveIfPrimitive(
        node,
        metricPolicy.containerLevelMetrics
      );
      if (containerLevelMetrics != 'ENABLED') {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

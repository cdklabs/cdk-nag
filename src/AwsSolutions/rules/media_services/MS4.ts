/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnContainer } from '@aws-cdk/aws-mediastore';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Media Store containers define metric policies to send metrics to CloudWatch
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnContainer) {
    const metricPolicy = Stack.of(node).resolve(node.metricPolicy);
    if (metricPolicy == undefined) {
      return false;
    }
    const containerLevelMetrics = Stack.of(node).resolve(
      metricPolicy.containerLevelMetrics
    );
    if (containerLevelMetrics != 'ENABLED') {
      return false;
    }
  }
  return true;
}

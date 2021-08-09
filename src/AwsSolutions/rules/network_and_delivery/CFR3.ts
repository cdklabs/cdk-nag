/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  CfnDistribution,
  CfnStreamingDistribution,
} from '@aws-cdk/aws-cloudfront';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudFront distributions have access logging enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDistribution) {
    const distributionConfig = Stack.of(node).resolve(node.distributionConfig);
    if (distributionConfig.logging == undefined) {
      return false;
    }
  } else if (node instanceof CfnStreamingDistribution) {
    const distributionConfig = Stack.of(node).resolve(
      node.streamingDistributionConfig
    );
    if (distributionConfig.logging == undefined) {
      return false;
    }
    const logging = Stack.of(node).resolve(distributionConfig.logging);
    const enabled = Stack.of(node).resolve(logging.enabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}

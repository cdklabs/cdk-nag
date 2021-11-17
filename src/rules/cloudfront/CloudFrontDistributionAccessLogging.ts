/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import {
  CfnDistribution,
  CfnStreamingDistribution,
} from '@aws-cdk/aws-cloudfront';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * CloudFront distributions have access logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.distributionConfig
      );
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
      const enabled = resolveIfPrimitive(node, logging.enabled);
      if (!enabled) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * OpenSearch Service domains have Zone Awareness enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDomain) {
    const elasticsearchClusterConfig = Stack.of(node).resolve(
      node.elasticsearchClusterConfig
    );
    if (elasticsearchClusterConfig == undefined) {
      return false;
    }
    const zoneAwarenessEnabled = resolveIfPrimitive(
      node,
      elasticsearchClusterConfig.zoneAwarenessEnabled
    );
    if (!zoneAwarenessEnabled) {
      return false;
    }
  }
  return true;
}

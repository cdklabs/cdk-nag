/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * OpenSearch Service domains have Zone Awareness enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof LegacyCfnDomain) {
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
  } else if (node instanceof CfnDomain) {
    const clusterConfig = Stack.of(node).resolve(node.clusterConfig);
    if (clusterConfig == undefined) {
      return false;
    }
    const zoneAwarenessEnabled = resolveIfPrimitive(
      node,
      clusterConfig.zoneAwarenessEnabled
    );
    if (!zoneAwarenessEnabled) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDomain as LegacyCfnDomain } from 'aws-cdk-lib/aws-elasticsearch';
import { CfnDomain } from 'aws-cdk-lib/aws-opensearchservice';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * OpenSearch Service domains use dedicated master nodes
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof LegacyCfnDomain) {
      const elasticsearchClusterConfig = Stack.of(node).resolve(
        node.elasticsearchClusterConfig
      );
      if (elasticsearchClusterConfig == undefined) {
        return false;
      }
      const dedicatedMasterEnabled = resolveIfPrimitive(
        node,
        elasticsearchClusterConfig.dedicatedMasterEnabled
      );
      if (!dedicatedMasterEnabled) {
        return false;
      }
    } else if (node instanceof CfnDomain) {
      const clusterConfig = Stack.of(node).resolve(node.clusterConfig);
      if (clusterConfig == undefined) {
        return false;
      }
      const dedicatedMasterEnabled = resolveIfPrimitive(
        node,
        clusterConfig.dedicatedMasterEnabled
      );
      if (!dedicatedMasterEnabled) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

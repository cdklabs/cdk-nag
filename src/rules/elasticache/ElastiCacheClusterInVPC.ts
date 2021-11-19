/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import {
  CfnCacheCluster,
  CfnReplicationGroup,
} from 'aws-cdk-lib/aws-elasticache';

/**
 * ElastiCache clusters are provisioned in a VPC
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (
      node instanceof CfnCacheCluster ||
      node instanceof CfnReplicationGroup
    ) {
      if (
        node.cacheSubnetGroupName == undefined ||
        node.cacheSubnetGroupName.length == 0
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

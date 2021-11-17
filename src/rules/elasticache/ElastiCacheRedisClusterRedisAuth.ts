/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';

/**
 * ElastiCache Redis clusters use Redis AUTH for user authentication
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnReplicationGroup) {
      if (node.authToken == undefined || node.authToken.length == 0) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

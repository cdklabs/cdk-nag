/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * ElastiCache Redis clusters have both encryption in transit and at rest enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnReplicationGroup) {
      if (
        node.atRestEncryptionEnabled == undefined ||
        node.transitEncryptionEnabled == undefined
      ) {
        return false;
      }
      const rest = resolveIfPrimitive(node, node.atRestEncryptionEnabled);
      const transit = resolveIfPrimitive(node, node.transitEncryptionEnabled);
      if (rest == false || transit == false) {
        return false;
      }
    }

    return true;
  },
  'name',
  { value: parse(__filename).name }
);

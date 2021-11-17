/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnReplicationInstance } from '@aws-cdk/aws-dms';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * DMS replication instances are not public
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnReplicationInstance) {
      const publicAccess = resolveIfPrimitive(node, node.publiclyAccessible);
      if (publicAccess !== false) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnReplicationInstance } from '@aws-cdk/aws-dms';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * DMS replication instances are not public - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnReplicationInstance) {
    const publicAccess = resolveIfPrimitive(node, node.publiclyAccessible);
    if (publicAccess !== false) {
      return false;
    }
  }
  return true;
}

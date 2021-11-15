/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-docdb';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Document DB clusters do not use the default endpoint port
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      const port = resolveIfPrimitive(node, node.port);
      if (port == undefined || port == 27017) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

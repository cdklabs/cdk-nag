/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Redshift clusters do not use the default endpoint port
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const port = resolveIfPrimitive(node, node.port);
      if (port == undefined || port == 5439) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

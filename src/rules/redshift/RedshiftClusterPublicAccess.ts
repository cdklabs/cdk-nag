/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Redshift clusters do not allow public access
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const publicAccess = resolveIfPrimitive(node, node.publiclyAccessible);
      if (publicAccess === true) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

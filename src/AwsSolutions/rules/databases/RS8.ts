/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Redshift clusters are not publicly accessible
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const publiclyAccessible = resolveIfPrimitive(
        node,
        node.publiclyAccessible
      );
      if (publiclyAccessible === true) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

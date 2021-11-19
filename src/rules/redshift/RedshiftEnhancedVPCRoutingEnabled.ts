/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-redshift';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Redshift clusters have enhanced VPC routing enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const enhancedVpcRouting = resolveIfPrimitive(
        node,
        node.enhancedVpcRouting
      );
      if (enhancedVpcRouting !== true) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

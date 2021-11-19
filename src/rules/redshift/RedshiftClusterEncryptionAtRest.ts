/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-redshift';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Redshift clusters have encryption at rest enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      if (node.encrypted == undefined) {
        return false;
      }
      const encrypted = resolveIfPrimitive(node, node.encrypted);
      if (!encrypted) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

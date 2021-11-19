/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-redshift';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Redshift clusters have encryption and audit logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const encrypted = resolveIfPrimitive(node, node.encrypted);
      const loggingProperties = Stack.of(node).resolve(node.loggingProperties);
      if (!encrypted || loggingProperties == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Redshift clusters have audit logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const loggingProperties = Stack.of(node).resolve(node.loggingProperties);
      if (loggingProperties == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

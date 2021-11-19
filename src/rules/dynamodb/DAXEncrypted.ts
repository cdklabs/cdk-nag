/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-dax';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * DAX clusters have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      if (node.sseSpecification == undefined) {
        return false;
      }
      const sseSpecification = Stack.of(node).resolve(node.sseSpecification);
      const enabled = resolveIfPrimitive(node, sseSpecification.sseEnabled);
      if (!enabled) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

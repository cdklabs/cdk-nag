/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * RDS Aurora serverless clusters have Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      const engine = resolveIfPrimitive(node, node.engine).toLowerCase();
      const backtrackWindow = resolveIfPrimitive(node, node.backtrackWindow);
      if (engine == 'aurora' || engine == 'aurora-mysql') {
        if (backtrackWindow == undefined || backtrackWindow == 0) {
          return false;
        }
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

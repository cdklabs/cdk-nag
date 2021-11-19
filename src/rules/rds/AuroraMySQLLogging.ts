/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster } from 'aws-cdk-lib/aws-rds';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * RDS Aurora MySQL serverless clusters have audit, error, general, and slowquery Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      const engine = resolveIfPrimitive(node, node.engine).toLowerCase();
      const engineMode = resolveIfPrimitive(
        node,
        node.engineMode
      ).toLowerCase();
      if (
        engineMode != undefined &&
        engineMode.toLowerCase() == 'serverless' &&
        (engine.toLowerCase() == 'aurora' ||
          engine.toLowerCase() == 'aurora-mysql')
      ) {
        if (node.enableCloudwatchLogsExports == undefined) {
          return false;
        }
        const needed = ['audit', 'error', 'general', 'slowquery'];
        const exports = node.enableCloudwatchLogsExports.map((i) => {
          return i.toLowerCase();
        });
        return needed.every((i) => exports.includes(i));
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';

/**
 * RDS Aurora MySQL serverless clusters have audit, error, general, and slowquery Log Exports enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    if (
      node.engineMode != undefined &&
      node.engineMode.toLowerCase() == 'serverless' &&
      (node.engine.toLowerCase() == 'aurora' ||
        node.engine.toLowerCase() == 'aurora-mysql')
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
}

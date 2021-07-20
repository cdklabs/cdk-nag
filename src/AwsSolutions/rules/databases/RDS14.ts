/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';

/**
 * RDS Aurora serverless clusters have Log Exports enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    const engine = node.engine.toLowerCase();
    if (engine == 'aurora' || engine == 'aurora-mysql') {
      if (node.backtrackWindow == undefined || node.backtrackWindow == 0) {
        return false;
      }
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * RDS DB instances are configured to export all possible log types to CloudWatch - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const dbType = JSON.stringify(resolveIfPrimitive(node, node.engine));
    const dbLogs = JSON.stringify(
      Stack.of(node).resolve(node.enableCloudwatchLogsExports)
    );
    if (dbLogs == undefined) {
      return false;
    }

    if (dbType.includes('mariadb') || dbType.includes('mysql')) {
      if (
        !(
          dbLogs.includes('audit') &&
          dbLogs.includes('error') &&
          dbLogs.includes('general') &&
          dbLogs.includes('slowquery')
        )
      )
        return false;
    }

    if (dbType.includes('postgres')) {
      if (!(dbLogs.includes('postgresql') && dbLogs.includes('upgrade')))
        return false;
    }

    if (dbType.includes('oracle')) {
      if (
        !(
          dbLogs.includes('audit') &&
          dbLogs.includes('alert') &&
          dbLogs.includes('listener') &&
          dbLogs.includes('oemagent') &&
          dbLogs.includes('trace')
        )
      )
        return false;
    }

    if (dbType.includes('sqlserver')) {
      if (!(dbLogs.includes('agent') && dbLogs.includes('error'))) return false;
    }
  }
  return true;
}

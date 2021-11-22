/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * RDS DB instances are configured to export all possible log types to CloudWatch
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBInstance) {
      const dbType = JSON.stringify(resolveIfPrimitive(node, node.engine));
      const dbLogs = JSON.stringify(
        Stack.of(node).resolve(node.enableCloudwatchLogsExports)
      );
      if (dbLogs == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      if (dbType.includes('mariadb') || dbType.includes('mysql')) {
        if (
          !(
            dbLogs.includes('audit') &&
            dbLogs.includes('error') &&
            dbLogs.includes('general') &&
            dbLogs.includes('slowquery')
          )
        ) {
          NagRuleCompliance.NON_COMPLIANT;
        }
      }

      if (dbType.includes('postgres')) {
        if (!(dbLogs.includes('postgresql') && dbLogs.includes('upgrade'))) {
          NagRuleCompliance.NON_COMPLIANT;
        }
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
        ) {
          NagRuleCompliance.NON_COMPLIANT;
        }
      }

      if (dbType.includes('sqlserver')) {
        if (!(dbLogs.includes('agent') && dbLogs.includes('error'))) {
          NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

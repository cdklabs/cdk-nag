/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance, DatabaseInstanceEngine } from '@aws-cdk/aws-rds';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * RDS Database Instances are configured to export all possible log types to Cloudwatch - (Control IDs: AC-2(1), AC-2(j), AC-3, AC-6)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDBInstance) {    
    const dbType = Stack.of(node).resolve(node.engine);
    const dbLogs = Stack.of(node).resolve(node.enableCloudwatchLogsExports);
    if (dbLogs == undefined){
        return false;
    }
    const exportString = JSON.stringify(dbLogs);
    if (dbType == (DatabaseInstanceEngine.mariaDb || DatabaseInstanceEngine.mysql)){
        if (
        (exportString.search('audit') < 0) ||
        (exportString.search('error') < 0) ||
        (exportString.search('general') < 0) ||
        (exportString.search('slowquery') < 0)
        )
        return false;
    }
    if (dbType == DatabaseInstanceEngine.postgres){
        if (
        (exportString.search('postgresql') < 0) ||
        (exportString.search('upgrade') < 0)
        )
        return false;
    }
    if (dbType == (DatabaseInstanceEngine.oracleEe || DatabaseInstanceEngine.oracleSe2)){
        if (
        (exportString.search('audit') < 0) ||
        (exportString.search('alert') < 0) ||
        (exportString.search('listener') < 0) ||
        (exportString.search('oemagent') < 0) ||
        (exportString.search('trace') < 0)
        )
        return false;
    }
    if (dbType == (
        DatabaseInstanceEngine.sqlServerEe || 
        DatabaseInstanceEngine.sqlServerEx || 
        DatabaseInstanceEngine.sqlServerSe || 
        DatabaseInstanceEngine.sqlServerWeb)
        ){
        if (
        (exportString.search('agent') < 0) ||
        (exportString.search('error') < 0)
        )
        return false;
    }
  }
  return true;
}

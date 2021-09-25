/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';

/**
 * RDS DB instances have enhanced monitoring enabled - (Control ID: CA-7(a)(b))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const enhancedMonitoring = node.monitoringInterval;
    if (enhancedMonitoring == undefined || enhancedMonitoring <= 0) {
      return false;
    }
  }
  return true;
}

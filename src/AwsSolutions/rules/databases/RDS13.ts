/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 *  RDS instances and are configured for automated backups
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const backupRetentionPeriod = Stack.of(node).resolve(node.backupRetentionPeriod);
    if (!(backupRetentionPeriod == undefined || backupRetentionPeriod > 0)) {
      return false;
    }
  }
  return true;
}

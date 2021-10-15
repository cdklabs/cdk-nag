/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 *  RDS DB instances and are configured for automated backups
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const backupRetentionPeriod = resolveIfPrimitive(
      node,
      node.backupRetentionPeriod
    );
    if (!(backupRetentionPeriod == undefined || backupRetentionPeriod > 0)) {
      return false;
    }
  }
  return true;
}

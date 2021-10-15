/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * RDS DB instances have backup enabled - (Control IDs: CP-9(b), CP-10, SI-12)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const backup = resolveIfPrimitive(node, node.backupRetentionPeriod);
    if (backup == undefined || backup <= 0) {
      return false;
    }
  }
  return true;
}

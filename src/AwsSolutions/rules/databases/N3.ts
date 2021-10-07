/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster } from '@aws-cdk/aws-neptune';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../..';

/**
 * Neptune DB clusters have a reasonable minimum backup retention period configured
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    const backupRetentionPeriod = resolveIfPrimitive(
      node,
      node.backupRetentionPeriod
    );
    if (backupRetentionPeriod == undefined || backupRetentionPeriod < 7) {
      return false;
    }
  }
  return true;
}

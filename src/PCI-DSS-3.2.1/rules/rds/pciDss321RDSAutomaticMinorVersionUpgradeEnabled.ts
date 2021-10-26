/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * RDS DB instances have automatic minor version upgrades enabled - (Control ID: 6.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const autoMinorVersionUpgrade = resolveIfPrimitive(
      node,
      node.autoMinorVersionUpgrade
    );
    if (autoMinorVersionUpgrade === false) {
      return false;
    }
  }
  return true;
}

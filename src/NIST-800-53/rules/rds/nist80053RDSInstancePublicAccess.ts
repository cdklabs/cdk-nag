/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * RDS DB instances are not publicly accessible - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const publicAccess = resolveIfPrimitive(node, node.publiclyAccessible);
    if (publicAccess !== false) {
      return false;
    }
    return true;
  }
  return true;
}

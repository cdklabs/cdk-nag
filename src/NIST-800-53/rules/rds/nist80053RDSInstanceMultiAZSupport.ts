/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 *  Non-Aurora RDS DB instances have multi-AZ support enabled - (Control IDs: CP-10, SC-5, SC-36)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const multiAz = resolveIfPrimitive(node, node.multiAz);
    const engine = resolveIfPrimitive(node, node.engine);
    if (
      !multiAz &&
      (engine == undefined || !engine.toLowerCase().includes('aurora'))
    ) {
      return false;
    }
  }
  return true;
}

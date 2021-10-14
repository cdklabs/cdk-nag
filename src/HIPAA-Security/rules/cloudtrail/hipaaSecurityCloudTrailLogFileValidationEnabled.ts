/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';
/**
 * CloudTrail trails have log file validation enabled - (Control ID: 164.312(c)(1), 164.312(c)(2))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnTrail) {
    const enabled = resolveIfPrimitive(node, node.enableLogFileValidation);

    if (enabled != true) {
      return false;
    }
  }
  return true;
}

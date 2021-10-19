/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnFileSystem } from '@aws-cdk/aws-efs';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Elastic File Systems are configured for encryption at rest - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnFileSystem) {
    const encrypted = resolveIfPrimitive(node, node.encrypted);
    if (encrypted === false) {
      return false;
    }
  }
  return true;
}

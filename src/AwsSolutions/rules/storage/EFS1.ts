/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnFileSystem } from '@aws-cdk/aws-efs';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Elastic File Systems are configured for encryption at rest.
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnFileSystem) {
    if (node.encrypted == undefined) {
      return false;
    }
    const encrypted = resolveIfPrimitive(node, node.encrypted);
    if (encrypted == false) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster } from '@aws-cdk/aws-neptune';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Neptune DB clusters have encryption at rest enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    if (node.storageEncrypted == undefined) {
      return false;
    }
    const storageEncrypted = resolveIfPrimitive(node, node.storageEncrypted);
    if (!storageEncrypted) {
      return false;
    }
  }
  return true;
}

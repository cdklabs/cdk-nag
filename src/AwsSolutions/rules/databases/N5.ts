/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster } from '@aws-cdk/aws-neptune';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Neptune DB clusters have IAM Database Authentication enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    if (node.iamAuthEnabled == undefined) {
      return false;
    }
    const iamAuthEnabled = Stack.of(node).resolve(node.iamAuthEnabled);
    if (!iamAuthEnabled) {
      return false;
    }
  }
  return true;
}

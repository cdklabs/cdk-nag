/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-emr';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * EMR clusters have S3 logging enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const logUri = Stack.of(node).resolve(node.logUri);
    if (logUri == undefined) {
      return false;
    }
  }
  return true;
}

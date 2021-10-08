/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Redshift clusters have version upgrade enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const allowVersionUpgrade = resolveIfPrimitive(
      node,
      node.allowVersionUpgrade
    );
    if (allowVersionUpgrade === false) {
      return false;
    }
  }
  return true;
}

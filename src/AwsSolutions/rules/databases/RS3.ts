/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Redshift clusters use custom user names vice the default (awsuser)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const masterUsername = resolveIfPrimitive(node, node.masterUsername);
    if (masterUsername == 'awsuser') {
      return false;
    }
  }
  return true;
}

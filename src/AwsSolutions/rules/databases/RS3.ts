/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';

/**
 * Redshift clusters use custom user names vice the default (awsuser)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    if (node.masterUsername == 'awsuser') {
      return false;
    }
  }
  return true;
}

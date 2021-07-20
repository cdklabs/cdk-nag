/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';

/**
 * Redshift clusters do not use the default endpoint port
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    if (node.port == undefined || node.port == 5439) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EC2 instances are created within VPCs - (Control IDs: AC-4, SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnFunction) {

    //Check for a VPC configuration
    const vpcConfig = Stack.of(node).resolve(node.vpcConfig);
    if (vpcConfig == undefined) {
      return false;
    }
  }
  return true;
}

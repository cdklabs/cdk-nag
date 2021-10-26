/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnInstance } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * EC2 instances are created within VPCs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnInstance) {
    //If we are in a VPC, then we'll have a subnet
    const subnetId = Stack.of(node).resolve(node.subnetId);
    if (subnetId == undefined) {
      return false;
    }
  }
  return true;
}

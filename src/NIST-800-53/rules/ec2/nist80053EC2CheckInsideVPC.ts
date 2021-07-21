/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnInstance } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EC2 instances are created within VPCs - (Control IDs: AC-4, SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnInstance) {
    //If we are in a VPC, then we'll have a subnet
    const subnetId = Stack.of(node).resolve(node.subnetId);
    if (subnetId == undefined) {
      return false;
    }
  }
  return true;
}

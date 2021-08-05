/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Lambda functions are created within VPCs - (Control IDs: AC-4, SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnFunction) {

    //Check for a VPC configuration
    const vpcConfig = Stack.of(node).resolve(node.vpcConfig);
    if (vpcConfig == undefined) {
      return false;
    } else {
      const secgroups = Stack.of(node).resolve(vpcConfig.securityGroupIds);
      const subnets = Stack.of(node).resolve(vpcConfig.subnetIds);
      //Does this function exist within at least one VPC security group or subnet?
      if (secgroups == undefined || secgroups.length == 0) {
        if (subnets == undefined || subnets.length ==0) {
          return false;
        }
      }
    }
  }
  return true;
}

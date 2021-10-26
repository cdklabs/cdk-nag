/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Lambda functions are VPC enabled - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 2.2.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnFunction) {
    const vpcConfig = Stack.of(node).resolve(node.vpcConfig);
    if (vpcConfig == undefined) {
      return false;
    } else {
      const secgroups = Stack.of(node).resolve(vpcConfig.securityGroupIds);
      const subnets = Stack.of(node).resolve(vpcConfig.subnetIds);
      if (secgroups == undefined || secgroups.length == 0) {
        if (subnets == undefined || subnets.length == 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Lambda functions are VPC enabled - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-25)
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

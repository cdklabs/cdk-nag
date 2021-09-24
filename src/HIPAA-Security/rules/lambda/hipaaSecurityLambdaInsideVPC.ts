/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnFunction } from '@aws-cdk/aws-lambda';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Lambda functions are VPC enabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
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

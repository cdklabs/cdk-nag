/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnVPC } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';

/**
 * VPCs have their default security group closed - (Control IDs: AC-4(21), AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-6a, CM-9b, SC-7a, SC-7c, SC-7(5), SC-7(7), SC-7(11), SC-7(12), SC-7(16), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28))
 * VPCs created via CloudFormation will not have their default security group closed.
 * https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnVPC) {
    return false;
  }
  return true;
}

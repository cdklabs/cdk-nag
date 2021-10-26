/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnVPC } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';

/**
 * VPCs have their default security group closed - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.1, 2.2, 2.2.2)
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

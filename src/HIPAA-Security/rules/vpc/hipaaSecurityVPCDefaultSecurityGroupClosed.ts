/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnVPC } from '@aws-cdk/aws-ec2';
import { IConstruct } from '@aws-cdk/core';

/**
 * VPCs have their default security group closed - (Control ID: 164.312(e)(1))
 * VPCs created via CloudFormation will not have their default security group closed.
 * https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnVPC) {
    return false;
  }
  return true;
}

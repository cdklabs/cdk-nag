/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnRoute } from '@aws-cdk/aws-ec2';
import { IConstruct } from '@aws-cdk/core';

/**
 * Route tables do not have unrestricted routes ('0.0.0.0/0' or '::/0') to IGWs - (Control ID: 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnRoute) {
    if (node.gatewayId != undefined) {
      if (
        node.destinationCidrBlock != undefined &&
        node.destinationCidrBlock.includes('/0')
      ) {
        return false;
      }
      if (
        node.destinationIpv6CidrBlock != undefined &&
        node.destinationIpv6CidrBlock.includes('/0')
      ) {
        return false;
      }
    }
  }
  return true;
}

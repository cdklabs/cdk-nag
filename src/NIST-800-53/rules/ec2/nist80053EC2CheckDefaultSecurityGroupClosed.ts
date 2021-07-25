/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * The default security group for VPCs is closed - (AC-4, SC-7, SC-7(3)).
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnSecurityGroup) {
    const secGroupName = Stack.of(node).resolve(node.groupName);
    //is this a default security group?
    if (secGroupName == 'default') {
      const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
      const egressRules = Stack.of(node).resolve(node.securityGroupEgress);
      //Ensure there are no ingress or egress rules present
      if (ingressRules.length != 0 || egressRules.length != 0) {
        return false;
      }
    }

  }
  return true;
}

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
      //Do we have defined ingress or egress rulesets?  If so, do we have any rules?
      if (ingressRules != undefined) {
        if (ingressRules.length != 0) {
          return false;
        }
      }
      if (egressRules != undefined) {
        if (egressRules.length != 0) {
          return false;
        }
      }
    }

  }
  return true;
}

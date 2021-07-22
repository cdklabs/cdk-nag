/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecurityGroupIngress, CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';


const blockedPorts=[20, 21, 3389, 3309, 3306, 4333];

/**
 * EC2 instances have all common ports restricted - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/default-custom-security-groups.html
 * @param node the CfnResource to check
 */
function testPort (rule: CfnSecurityGroupIngress, portNum: Number): boolean {
  //Is a port range specified?
  if (rule.fromPort != undefined && rule.toPort != undefined) {
    if ((rule.fromPort <= portNum && rule.toPort >= portNum) ||
        (rule.fromPort == -1 || rule.toPort == -1) ||
        rule.ipProtocol == '-1') {
      return false;
    }
  } else {
    if (rule.fromPort == portNum || rule.ipProtocol == '-1') {
      return false;
    }
  }
  return true;
}

/**
 * Security Groups do not allow for unrestricted SSH traffic - (Control IDs: AC-4, SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnSecurityGroup) {
    const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
    if (ingressRules != undefined) {
      //For each ingress rule, ensure that it does not allow unrestricted SSH traffic.
      for (const rule of ingressRules) {
        const resolvedRule = Stack.of(node).resolve(rule);
        for (const portNum of blockedPorts) {
          if (!testPort(resolvedRule, portNum)) {
            return false;
          }
        }
      }
    }
  } else if (node instanceof CfnSecurityGroupIngress) {
    for (const portNum of blockedPorts) {
      if (!testPort(node, portNum)) {
        return false;
      }
    }
  }
  return true;
}

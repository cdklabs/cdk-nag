/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecurityGroupIngress, CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

const BLOCKED_PORTS = [20, 21, 3389, 3309, 3306, 4333];

/**
 * EC2 instances have all common TCP ports restricted for ingress IPv4 traffic - (Control IDs: AC-4(21), AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-2a, CM-2(2), CM-6a, CM-7b, CM-8(6), CM-9b, SC-7a, SC-7c, SC-7(5), SC-7(7), SC-7(11), SC-7(12), SC-7(16), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28))
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/default-custom-security-groups.html
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnSecurityGroup) {
    const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
    if (ingressRules != undefined) {
      //For each ingress rule, ensure that it does not allow unrestricted SSH traffic.
      for (const rule of ingressRules) {
        const resolvedRule = Stack.of(node).resolve(rule);
        for (const portNum of BLOCKED_PORTS) {
          if (!testPort(node, resolvedRule, portNum)) {
            return false;
          }
        }
      }
    }
  } else if (node instanceof CfnSecurityGroupIngress) {
    for (const portNum of BLOCKED_PORTS) {
      if (!testPort(node, node, portNum)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Helper function to identify if the given port number is unrestricted
 * @param node the CfnResource to check
 * @param rule the CfnSecurityGroupIngress rule to check
 * @param portNum the number of the port to check
 */
function testPort(
  node: CfnResource,
  rule: CfnSecurityGroupIngress,
  portNum: Number
): boolean {
  //Does this rule apply to TCP traffic?
  const ipProtocol = resolveIfPrimitive(node, rule.ipProtocol);
  const cidrIp = resolveIfPrimitive(node, rule.cidrIp);
  const fromPort = resolveIfPrimitive(node, rule.fromPort);
  const toPort = resolveIfPrimitive(node, rule.toPort);
  if (ipProtocol === 'tcp') {
    //Does this rule allow all IPv4 addresses (unrestricted access)?
    if (cidrIp != undefined && cidrIp.includes('/0')) {
      //Is a port range specified?
      if (fromPort != undefined && toPort != undefined) {
        if (
          (fromPort <= portNum && toPort >= portNum) ||
          fromPort == -1 ||
          toPort == -1
        ) {
          return false;
        }
      } else {
        if (fromPort == portNum) {
          return false;
        }
      }
    }
  }
  //Are all ports allowed?
  if (ipProtocol === '-1') {
    return false;
  }
  return true;
}

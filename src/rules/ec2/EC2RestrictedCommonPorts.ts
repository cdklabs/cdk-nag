/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';

import { CfnSecurityGroupIngress, CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

const BLOCKED_PORTS = [20, 21, 3389, 3309, 3306, 4333];

/**
 * EC2 instances have all common TCP ports restricted for ingress IPv4 traffic
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/default-custom-security-groups.html
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);

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

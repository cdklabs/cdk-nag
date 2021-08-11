/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecurityGroupIngress, CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

//list of allowed TCP ports, can be altered as needed
const allowedPorts = [80];

/**
 * VPC Security Groups have only authorized TCP ports unrestricted for IPv4 traffic - (AC-4, SC-7, SC-7(3)).
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/default-custom-security-groups.html
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnSecurityGroup) {
    const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
    if (ingressRules != undefined) {
      //For each ingress rule, check if it allows unrestricted access to a port NOT listed under the "allowedPorts" variable
      for (const rule of ingressRules) {
        const resolvedRule = Stack.of(node).resolve(rule);
        if (!checkRuleCompliance(resolvedRule)) {
          return false;
        }
      }
    }
  } else if (node instanceof CfnSecurityGroupIngress) {
    if (!checkRuleCompliance(node)) {
      return false;
    }
  }
  return true;
}

/**
 * Helper function to identify if the given port number is unrestricted
 * @param rule the CfnSecurityGroupIngress rule to check
 * @param portNum the number of the port to check
 */
function checkRuleCompliance(rule: CfnSecurityGroupIngress): boolean {
  //does this rule specify TCP traffic?
  if (rule.ipProtocol != undefined && rule.ipProtocol == 'tcp') {
    //Does this rule allow all IPv4 addresses (unrestricted access)?
    if (rule.cidrIp != undefined && rule.cidrIp.includes('/0')) {
      //Is a port range specified?
      if (rule.fromPort != undefined && rule.toPort != undefined) {
        //iterate through each port in the range, checking if its allowed
        for (let i = rule.fromPort; i < rule.toPort; i++) {
          if (!allowedPorts.includes(i)) {
            return false;
          }
        }
      } else {
        if (
          rule.fromPort != undefined &&
          !allowedPorts.includes(rule.fromPort)
        ) {
          return false;
        }
      }
    }
  }
  //Are all ports allowed?
  if (rule.ipProtocol != undefined && rule.ipProtocol == '-1') {
    return false;
  } else {
    return true;
  }
}

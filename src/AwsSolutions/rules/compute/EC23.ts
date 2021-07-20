/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnSecurityGroup, CfnSecurityGroupIngress } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EC2 security groups do not allow for 0.0.0.0/0 or ::/0 inbound access
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnSecurityGroup) {
    const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
    if (ingressRules != undefined) {
      for (const rule of ingressRules) {
        const resolvedRule = Stack.of(node).resolve(rule);
        if (resolvedRule.cidrIp != undefined && resolvedRule.cidrIp.includes('/0')) {
          return false;
        }
        if (resolvedRule.cidrIpv6 != undefined && resolvedRule.cidrIpv6.includes('/0')) {
          return false;
        }
      }
    }
  } else if (node instanceof CfnSecurityGroupIngress) {
    if (node.cidrIp != undefined && node.cidrIp.includes('/0')) {
      return false;
    }
    if (node.cidrIpv6 != undefined && node.cidrIpv6.includes('/0')) {
      return false;
    }
  }
  return true;
}

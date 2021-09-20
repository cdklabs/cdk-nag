/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecurityGroupIngress, CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Security Groups do not allow for unrestricted SSH traffic - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnSecurityGroup) {
    const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
    if (ingressRules != undefined) {
      //For each ingress rule, ensure that it does not allow unrestricted SSH traffic.
      for (const rule of ingressRules) {
        const resolvedRule = Stack.of(node).resolve(rule);
        if (
          (resolvedRule.cidrIp != undefined &&
            resolvedRule.cidrIp.includes('/0')) ||
          (resolvedRule.cidrIpv6 != undefined &&
            resolvedRule.cidrIpv6.includes('/0'))
        ) {
          if (
            resolvedRule.fromPort != undefined &&
            resolvedRule.toPort != undefined
          ) {
            if (
              (resolvedRule.fromPort <= 22 && resolvedRule.toPort >= 22) ||
              resolvedRule.fromPort == -1 ||
              resolvedRule.toPort == -1 ||
              resolvedRule.ipProtocol == '-1'
            ) {
              return false;
            }
          } else {
            if (
              resolvedRule.fromPort == 22 ||
              resolvedRule.ipProtocol == '-1'
            ) {
              return false;
            }
          }
        }
      }
    }
  } else if (node instanceof CfnSecurityGroupIngress) {
    if (
      (node.cidrIp != undefined && node.cidrIp.includes('/0')) ||
      (node.cidrIpv6 != undefined && node.cidrIpv6.includes('/0'))
    ) {
      //Is a port range specified?
      if (node.fromPort != undefined && node.toPort != undefined) {
        if (
          (node.fromPort <= 22 && node.toPort >= 22) ||
          node.fromPort == -1 ||
          node.toPort == -1 ||
          node.ipProtocol == '-1'
        ) {
          return false;
        }
      } else {
        if (node.fromPort == 22 || node.ipProtocol == '-1') {
          return false;
        }
      }
    }
  }
  return true;
}

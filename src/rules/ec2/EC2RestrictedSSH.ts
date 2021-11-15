/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';

import { CfnSecurityGroupIngress, CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Security Groups do not allow for unrestricted SSH traffic
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
          const ipProtocol = resolveIfPrimitive(node, resolvedRule.ipProtocol);
          const cidrIp = resolveIfPrimitive(node, resolvedRule.cidrIp);
          const cidrIpv6 = resolveIfPrimitive(node, resolvedRule.cidrIpv6);
          const fromPort = resolveIfPrimitive(node, resolvedRule.fromPort);
          const toPort = resolveIfPrimitive(node, resolvedRule.toPort);
          if (
            (cidrIp != undefined && cidrIp.includes('/0')) ||
            (cidrIpv6 != undefined && cidrIpv6.includes('/0'))
          ) {
            if (fromPort != undefined && toPort != undefined) {
              if (
                (fromPort <= 22 && toPort >= 22) ||
                fromPort == -1 ||
                toPort == -1 ||
                ipProtocol == '-1'
              ) {
                return false;
              }
            } else {
              if (fromPort == 22 || ipProtocol == '-1') {
                return false;
              }
            }
          }
        }
      }
    } else if (node instanceof CfnSecurityGroupIngress) {
      const ipProtocol = resolveIfPrimitive(node, node.ipProtocol);
      const cidrIp = resolveIfPrimitive(node, node.cidrIp);
      const cidrIpv6 = resolveIfPrimitive(node, node.cidrIpv6);
      const fromPort = resolveIfPrimitive(node, node.fromPort);
      const toPort = resolveIfPrimitive(node, node.toPort);
      if (
        (cidrIp != undefined && cidrIp.includes('/0')) ||
        (cidrIpv6 != undefined && cidrIpv6.includes('/0'))
      ) {
        //Is a port range specified?
        if (fromPort != undefined && toPort != undefined) {
          if (
            (fromPort <= 22 && toPort >= 22) ||
            fromPort == -1 ||
            toPort == -1 ||
            ipProtocol == '-1'
          ) {
            return false;
          }
        } else {
          if (fromPort == 22 || ipProtocol == '-1') {
            return false;
          }
        }
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

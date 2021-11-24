/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnSecurityGroupIngress, CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Security Groups do not allow for unrestricted SSH traffic
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSecurityGroup) {
      const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
      if (ingressRules != undefined) {
        //For each ingress rule, ensure that it does not allow unrestricted SSH traffic.
        for (const rule of ingressRules) {
          const resolvedRule = Stack.of(node).resolve(rule);
          const ipProtocol = NagRules.resolveIfPrimitive(
            node,
            resolvedRule.ipProtocol
          );
          const cidrIp = NagRules.resolveIfPrimitive(node, resolvedRule.cidrIp);
          const cidrIpv6 = NagRules.resolveIfPrimitive(
            node,
            resolvedRule.cidrIpv6
          );
          const fromPort = NagRules.resolveIfPrimitive(
            node,
            resolvedRule.fromPort
          );
          const toPort = NagRules.resolveIfPrimitive(node, resolvedRule.toPort);
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
                return NagRuleCompliance.NON_COMPLIANT;
              }
            } else {
              if (fromPort == 22 || ipProtocol == '-1') {
                return NagRuleCompliance.NON_COMPLIANT;
              }
            }
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnSecurityGroupIngress) {
      const ipProtocol = NagRules.resolveIfPrimitive(node, node.ipProtocol);
      const cidrIp = NagRules.resolveIfPrimitive(node, node.cidrIp);
      const cidrIpv6 = NagRules.resolveIfPrimitive(node, node.cidrIpv6);
      const fromPort = NagRules.resolveIfPrimitive(node, node.fromPort);
      const toPort = NagRules.resolveIfPrimitive(node, node.toPort);
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
            return NagRuleCompliance.NON_COMPLIANT;
          }
        } else {
          if (fromPort == 22 || ipProtocol == '-1') {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

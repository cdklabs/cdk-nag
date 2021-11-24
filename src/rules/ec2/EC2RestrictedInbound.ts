/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnSecurityGroup, CfnSecurityGroupIngress } from 'aws-cdk-lib/aws-ec2';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * EC2 security groups do not allow for 0.0.0.0/0 or ::/0 inbound access
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSecurityGroup) {
      const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
      if (ingressRules != undefined) {
        for (const rule of ingressRules) {
          const resolvedRule = Stack.of(node).resolve(rule);
          const resolvedcidrIp = resolveIfPrimitive(node, resolvedRule.cidrIp);
          const resolvedcidrIpv6 = resolveIfPrimitive(
            node,
            resolvedRule.cidrIpv6
          );
          if (resolvedcidrIp != undefined && resolvedcidrIp.includes('/0')) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
          if (
            resolvedcidrIpv6 != undefined &&
            resolvedcidrIpv6.includes('/0')
          ) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnSecurityGroupIngress) {
      const resolvedcidrIp = resolveIfPrimitive(node, node.cidrIp);
      const resolvedcidrIpv6 = resolveIfPrimitive(node, node.cidrIpv6);
      if (resolvedcidrIp != undefined && resolvedcidrIp.includes('/0')) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      if (resolvedcidrIpv6 != undefined && resolvedcidrIpv6.includes('/0')) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

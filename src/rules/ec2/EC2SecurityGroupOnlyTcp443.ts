/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnSecurityGroupIngress, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Security Groups only allow inbound access to traffic using TCP on port 443
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSecurityGroup) {
      const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);

      if (ingressRules) {
        for (const rule of ingressRules) {
          const resolvedcidrIp = NagRules.resolveIfPrimitive(
            node,
            Stack.of(node).resolve(rule).cidrIp
          );
          const resolvedcidrIpv6 = NagRules.resolveIfPrimitive(
            node,
            Stack.of(node).resolve(rule).cidrIpv6
          );

          if (resolvedcidrIp) {
            if (!resolvedcidrIp.includes('/0')) {
              return NagRuleCompliance.COMPLIANT;
            }
          }
          if (resolvedcidrIpv6) {
            if (!resolvedcidrIpv6.includes('/0')) {
              return NagRuleCompliance.COMPLIANT;
            }
          }

          const ipProtocol = NagRules.resolveIfPrimitive(
            node,
            Stack.of(node).resolve(rule).ipProtocol
          );
          const toPort = NagRules.resolveIfPrimitive(
            node,
            Stack.of(node).resolve(rule).toPort
          );

          if (!toPort) {
            return NagRuleCompliance.NON_COMPLIANT;
          }

          if (!(toPort === 443 && ipProtocol === 'tcp')) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }

      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnSecurityGroupIngress) {
      const resolvedcidrIp = NagRules.resolveIfPrimitive(node, node.cidrIp);
      const resolvedcidrIpv6 = NagRules.resolveIfPrimitive(node, node.cidrIpv6);

      if (resolvedcidrIp) {
        if (!resolvedcidrIp.includes('/0')) {
          return NagRuleCompliance.COMPLIANT;
        }
      }
      if (resolvedcidrIpv6) {
        if (!resolvedcidrIpv6.includes('/0')) {
          return NagRuleCompliance.COMPLIANT;
        }
      }

      const ipProtocol = NagRules.resolveIfPrimitive(node, node.ipProtocol);
      const toPort = NagRules.resolveIfPrimitive(node, node.toPort);

      if (!toPort) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      if (!(toPort === 443 && ipProtocol === 'tcp')) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      return NagRuleCompliance.COMPLIANT;
    }

    return NagRuleCompliance.NOT_APPLICABLE;
  },

  'name',
  { value: parse(__filename).name }
);

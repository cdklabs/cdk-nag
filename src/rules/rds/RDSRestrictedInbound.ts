/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import {
  CfnDBSecurityGroup,
  CfnDBSecurityGroupIngress,
} from 'aws-cdk-lib/aws-rds';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * RDS DB security groups do not allow for 0.0.0.0/0 inbound access
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBSecurityGroup) {
      const ingressRules = Stack.of(node).resolve(node.dbSecurityGroupIngress);
      if (ingressRules != undefined) {
        for (const rule of ingressRules) {
          const resolvedRule = Stack.of(node).resolve(rule);
          const resolvedcidrIp = NagRules.resolveIfPrimitive(
            node,
            resolvedRule.cidrip
          );
          if (resolvedcidrIp != undefined && resolvedcidrIp.includes('/0')) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnDBSecurityGroupIngress) {
      const resolvedcidrIp = NagRules.resolveIfPrimitive(node, node.cidrip);
      if (resolvedcidrIp != undefined && resolvedcidrIp.includes('/0')) {
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

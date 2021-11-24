/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * Application Load Balancers are enabled to drop invalid headers
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      const type = resolveIfPrimitive(node, node.type);
      if (type == undefined || type == 'application') {
        const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
        if (attributes != undefined) {
          const reg =
            /"routing\.http\.drop_invalid_header_fields\.enabled","value":"true"/gm;
          if (JSON.stringify(attributes).search(reg) == -1) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        } else {
          return NagRuleCompliance.NON_COMPLIANT;
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

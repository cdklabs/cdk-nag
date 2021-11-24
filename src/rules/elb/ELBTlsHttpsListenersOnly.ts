/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      const listeners = Stack.of(node).resolve(node.listeners);
      for (const listener of listeners) {
        const resolvedListener = Stack.of(node).resolve(listener);
        const protocol = NagRules.resolveIfPrimitive(
          node,
          resolvedListener.protocol
        );
        const instanceProtocol = NagRules.resolveIfPrimitive(
          node,
          resolvedListener.instanceProtocol
        );
        if (protocol.toLowerCase() == 'ssl') {
          if (
            !(
              instanceProtocol == undefined ||
              instanceProtocol.toLowerCase() == 'ssl'
            )
          ) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        } else if (protocol.toLowerCase() == 'https') {
          if (
            !(
              instanceProtocol == undefined ||
              instanceProtocol.toLowerCase() == 'https'
            )
          ) {
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

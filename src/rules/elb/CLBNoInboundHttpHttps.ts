/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * CLBs are not used for incoming HTTP/HTTPS traffic. Use ALBs instead.
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      const listeners = Stack.of(node).resolve(node.listeners);
      for (const listener of listeners) {
        const resolvedListener = Stack.of(node).resolve(listener);
        const protocol = resolveIfPrimitive(node, resolvedListener.protocol);
        if (
          protocol.toLowerCase() == 'http' ||
          protocol.toLowerCase() == 'https'
        ) {
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

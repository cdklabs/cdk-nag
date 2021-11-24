/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancing';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * CLBs use ACM-managed certificates
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      //For each listener, ensure that it's utilizing an ACM SSL/HTTPS cert
      const listeners = Stack.of(node).resolve(node.listeners);
      if (listeners != undefined) {
        //Iterate through listeners, checking if secured ACM certs are used
        for (const listener of listeners) {
          const resolvedListener = Stack.of(node).resolve(listener);
          const listenerARN = resolveIfPrimitive(
            node,
            resolvedListener.sslCertificateId
          );
          //Use the ARN to check if this is an ACM managed cert
          if (listenerARN == undefined) {
            return NagRuleCompliance.NON_COMPLIANT;
          } else {
            const acmRegex = /^arn:[^:]+:acm:.+$/;
            if (!acmRegex.test(listenerARN)) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
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

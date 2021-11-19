/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

/**
 * ALBs, NLBs, and GLBs have deletion protection enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnLoadBalancer) {
      const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
      if (attributes != undefined) {
        var deletionProtectionEnabled = false;
        for (const attr of attributes) {
          const resolvedAttr = Stack.of(node).resolve(attr);
          if (
            resolvedAttr.key != undefined &&
            resolvedAttr.key == 'deletion_protection.enabled'
          ) {
            if (resolvedAttr.value == 'true') {
              deletionProtectionEnabled = true;
            }
          }
        }
        if (!deletionProtectionEnabled) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

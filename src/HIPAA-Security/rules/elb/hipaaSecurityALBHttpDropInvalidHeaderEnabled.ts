/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Application Load Balancers are enabled to drop invalid headers - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    const type = Stack.of(node).resolve(node.type);
    if (type == undefined || type == 'application') {
      const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
      if (attributes != undefined) {
        const reg =
          /"routing\.http\.drop_invalid_header_fields\.enabled","value":"true"/gm;
        if (JSON.stringify(attributes).search(reg) == -1) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
}

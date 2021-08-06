/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnListener } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ALB Http listeners are configured to redirect to https - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13, SC-23)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnListener) {
    let found = false;
    const protocol = Stack.of(node).resolve(node.protocol);
    const actions = Stack.of(node).resolve(node.defaultActions);

    if (protocol == 'HTTP') {
      for (const action of actions) {
        if (
          action.type == 'redirect' &&
          action.redirectConfig.protocol == 'HTTPS'
        ) {
          found = true;
        }
      }
      if (!found) return false;
    }
  }

  return true;
}

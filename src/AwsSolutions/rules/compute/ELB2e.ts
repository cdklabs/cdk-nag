/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ELBs have access logs enabled.
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    if (node.accessLoggingPolicy == undefined) {
      return false;
    }
    const accessLoggingPolicy = Stack.of(node).resolve(
      node.accessLoggingPolicy
    );
    const enabled = Stack.of(node).resolve(accessLoggingPolicy.enabled);

    if (enabled == false) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnLoadBalancer as CfnLoadBalancerV2 } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ELBs have access logs enabled - (Control ID: 164.312(b))
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
  } else if (node instanceof CfnLoadBalancerV2) {
    const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
    const reg = /"access_logs\.s3\.enabled","value":"true"/gm;

    if (JSON.stringify(attributes).search(reg) == -1) {
      return false;
    }
  }
  return true;
}

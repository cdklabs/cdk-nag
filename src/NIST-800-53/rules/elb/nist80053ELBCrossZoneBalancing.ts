/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ELBs are balanced across availability zones - (Control IDs: SC-5, CP-10)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLoadBalancer) {
    //Is cross zone balancing enabled?
    const crossZoneBalancing = Stack.of(node).resolve(node.crossZone);
    if (crossZoneBalancing != undefined) {
      if (crossZoneBalancing == false) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

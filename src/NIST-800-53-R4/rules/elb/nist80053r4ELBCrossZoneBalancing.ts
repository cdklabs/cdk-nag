/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * CLBs use at least two AZs with the Cross-Zone Load Balancing feature enabled - (Control IDs: SC-5, CP-10)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLoadBalancer) {
    if (node.crossZone == undefined) {
      return false;
    }
    if (node.subnets == undefined) {
      if (
        node.availabilityZones == undefined ||
        node.availabilityZones.length < 2
      ) {
        return false;
      }
    } else if (node.subnets.length < 2) {
      return false;
    }
    const crossZone = resolveIfPrimitive(node, node.crossZone);
    if (crossZone != true) {
      return false;
    }
  }
  return true;
}

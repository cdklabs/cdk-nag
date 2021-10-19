/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * CLBs use at least two AZs with the Cross-Zone Load Balancing feature enabled - (Control IDs: CP-1a.1(b), CP-1a.2, CP-2a, CP-2a.6, CP-2a.7, CP-2d, CP-2e, CP-2(5), CP-2(6), CP-6(2), CP-10, SC-5(2), SC-6, SC-22, SC-36, SI-13(5))
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

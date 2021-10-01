/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSubnet } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Subnets do not auto-assign public IP addresses - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnSubnet) {
    const mapPublicIpOnLaunch = Stack.of(node).resolve(
      node.mapPublicIpOnLaunch
    );
    const assignIpv6AddressOnCreation = Stack.of(node).resolve(
      node.assignIpv6AddressOnCreation
    );
    if (mapPublicIpOnLaunch === true || assignIpv6AddressOnCreation === true) {
      return false;
    }
  }
  return true;
}

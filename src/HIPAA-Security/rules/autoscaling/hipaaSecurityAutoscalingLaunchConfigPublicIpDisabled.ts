/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLaunchConfiguration } from '@aws-cdk/aws-autoscaling';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Auto Scaling launch configurations have public IP addresses disabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLaunchConfiguration) {
    const associatePublicIpAddress = Stack.of(node).resolve(
      node.associatePublicIpAddress
    );
    if (associatePublicIpAddress !== false) {
      return false;
    }
  }
  return true;
}

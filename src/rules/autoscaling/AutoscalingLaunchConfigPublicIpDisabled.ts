/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLaunchConfiguration } from '@aws-cdk/aws-autoscaling';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';
/**
 * Auto Scaling launch configurations have public IP addresses disabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLaunchConfiguration) {
    const associatePublicIpAddress = resolveIfPrimitive(
      node,
      node.associatePublicIpAddress
    );
    if (associatePublicIpAddress !== false) {
      return false;
    }
  }
  return true;
}

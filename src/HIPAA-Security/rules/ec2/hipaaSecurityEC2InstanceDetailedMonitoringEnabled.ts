/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLaunchConfiguration } from '@aws-cdk/aws-autoscaling';
import { CfnInstance } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * EC2 instances have detailed monitoring enabled - (Control ID: 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnInstance) {
    const monitoring = resolveIfPrimitive(node, node.monitoring);
    if (monitoring == undefined || monitoring == false) {
      return false;
    }
  } else if (node instanceof CfnLaunchConfiguration) {
    const monitoring = resolveIfPrimitive(node, node.instanceMonitoring);
    if (monitoring != undefined && monitoring == false) {
      return false;
    }
  }
  return true;
}

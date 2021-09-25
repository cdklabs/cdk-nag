/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLaunchConfiguration } from '@aws-cdk/aws-autoscaling';
import { CfnInstance } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EC2 instances have detailed monitoring enabled - (Control ID: 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnInstance) {
    const monitoring = Stack.of(node).resolve(node.monitoring);
    if (monitoring == undefined || monitoring == false) {
      return false;
    }
  } else if (node instanceof CfnLaunchConfiguration) {
    const monitoring = Stack.of(node).resolve(node.instanceMonitoring);
    if (monitoring != undefined && monitoring == false) {
      return false;
    }
  }
  return true;
}

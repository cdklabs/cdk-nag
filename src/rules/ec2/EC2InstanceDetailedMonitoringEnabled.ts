/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnLaunchConfiguration } from 'aws-cdk-lib/aws-autoscaling';
import { CfnInstance } from 'aws-cdk-lib/aws-ec2';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * EC2 instances have detailed monitoring enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);

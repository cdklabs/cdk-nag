/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnInstance } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

const EBS_OPTIMIZED_SUPPORTED = [
  'c1.xlarge',
  'c3.xlarge',
  'c3.2xlarge',
  'c3.4xlarge',
  'g2.2xlarge',
  'i2.xlarge',
  'i2.2xlarge',
  'i2.4xlarge',
  'm1.large',
  'm1.xlarge',
  'm2.2xlarge',
  'm2.4xlarge',
  'm3.xlarge',
  'm3.2xlarge',
  'r3.xlarge',
  'r3.2xlarge',
  'r3.4xlarge',
];
const DEFAULT_TYPE = 'm1.small';
/**
 * EC2 instance types that support EBS optimization and are not EBS optimized by default have EBS optimization enabled - (Control ID: 164.308(a)(7)(i))
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-optimized.html#previous
 *  @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnInstance) {
    const instanceType = node.instanceType
      ? resolveIfPrimitive(node, node.instanceType)
      : DEFAULT_TYPE;
    const ebsOptimized = Stack.of(node).resolve(node.ebsOptimized);
    if (
      EBS_OPTIMIZED_SUPPORTED.includes(instanceType) &&
      ebsOptimized !== true
    ) {
      return false;
    }
  }
  return true;
}

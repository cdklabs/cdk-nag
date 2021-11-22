/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnInstance } from 'aws-cdk-lib/aws-ec2';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

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
 * EC2 instance types that support EBS optimization and are not EBS optimized by default have EBS optimization enabled
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-optimized.html#previous
 *  @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnInstance) {
      const instanceType = node.instanceType
        ? resolveIfPrimitive(node, node.instanceType)
        : DEFAULT_TYPE;
      const ebsOptimized = Stack.of(node).resolve(node.ebsOptimized);
      if (
        EBS_OPTIMIZED_SUPPORTED.includes(instanceType) &&
        ebsOptimized !== true
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, CustomResource } from 'aws-cdk-lib';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * VPCs have their default security group closed
 * VPCs created via CloudFormation will not have their default security group closed.
 * The L2 VPC Construct provides a way to remmediate this via a custom resource.
 * @see https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup
 * @see https://github.com/aws/aws-cdk/pull/25297
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnVPC) {
      const parent = node.node.scope;
      if (parent) {
        const restrictSgCR = parent.node.tryFindChild(
          'RestrictDefaultSecurityGroupCustomResource'
        ) as CustomResource;
        if (
          restrictSgCR &&
          (restrictSgCR.node.defaultChild as CfnResource).cfnResourceType ==
            'Custom::VpcRestrictDefaultSG'
        ) {
          return NagRuleCompliance.COMPLIANT;
        } else {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      } else {
        return NagRuleCompliance.NON_COMPLIANT;
      }
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnFunction } from '@aws-cdk/aws-lambda';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Lambda functions are VPC enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFunction) {
      const vpcConfig = Stack.of(node).resolve(node.vpcConfig);
      if (vpcConfig == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else {
        const secgroups = Stack.of(node).resolve(vpcConfig.securityGroupIds);
        const subnets = Stack.of(node).resolve(vpcConfig.subnetIds);
        if (secgroups == undefined || secgroups.length == 0) {
          if (subnets == undefined || subnets.length == 0) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

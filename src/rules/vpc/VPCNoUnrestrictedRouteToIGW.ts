/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnRoute } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * Route tables do not have unrestricted routes ('0.0.0.0/0' or '::/0') to IGWs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnRoute) {
      if (node.gatewayId != undefined) {
        const destinationCidrBlock = resolveIfPrimitive(
          node,
          node.destinationCidrBlock
        );
        const destinationIpv6CidrBlock = resolveIfPrimitive(
          node,
          node.destinationIpv6CidrBlock
        );
        if (
          destinationCidrBlock != undefined &&
          destinationCidrBlock.includes('/0')
        ) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        if (
          destinationIpv6CidrBlock != undefined &&
          destinationIpv6CidrBlock.includes('/0')
        ) {
          return NagRuleCompliance.NON_COMPLIANT;
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

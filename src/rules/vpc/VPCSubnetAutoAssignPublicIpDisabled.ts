/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnSubnet } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * Subnets do not auto-assign public IP addresses
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSubnet) {
      const mapPublicIpOnLaunch = resolveIfPrimitive(
        node,
        node.mapPublicIpOnLaunch
      );
      const assignIpv6AddressOnCreation = resolveIfPrimitive(
        node,
        node.assignIpv6AddressOnCreation
      );
      if (
        mapPublicIpOnLaunch === true ||
        assignIpv6AddressOnCreation === true
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

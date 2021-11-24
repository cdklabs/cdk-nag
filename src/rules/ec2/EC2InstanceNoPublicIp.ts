/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnInstance } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * EC2 instances do not have public IPs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnInstance) {
      const networkInterfaces = Stack.of(node).resolve(node.networkInterfaces);
      if (networkInterfaces != undefined) {
        //Iterate through network interfaces, checking if public IPs are enabled
        for (const networkInterface of networkInterfaces) {
          const resolvedInterface = Stack.of(node).resolve(networkInterface);
          const associatePublicIpAddress = NagRules.resolveIfPrimitive(
            node,
            resolvedInterface.associatePublicIpAddress
          );
          if (associatePublicIpAddress === true) {
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

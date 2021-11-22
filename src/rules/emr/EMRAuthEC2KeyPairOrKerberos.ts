/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-emr';
import { NagRuleCompliance } from '../..';

/**
 * EMR clusters implement authentication via an EC2 Key Pair or Kerberos
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const kerberosAttributes = Stack.of(node).resolve(
        node.kerberosAttributes
      );
      if (kerberosAttributes == undefined) {
        const instanceConfig = Stack.of(node).resolve(node.instances);
        if (instanceConfig.ec2KeyName == undefined) {
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

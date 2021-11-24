/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * OpenSearch Service domains are within VPCs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const vpcOptions = Stack.of(node).resolve(node.vpcOptions);
      if (vpcOptions === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const subnetIds = Stack.of(node).resolve(vpcOptions.subnetIds);
      if (subnetIds === undefined || subnetIds.length === 0) {
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

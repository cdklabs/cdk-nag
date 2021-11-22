/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-redshift';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * Redshift clusters have enhanced VPC routing enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const enhancedVpcRouting = resolveIfPrimitive(
        node,
        node.enhancedVpcRouting
      );
      if (enhancedVpcRouting !== true) {
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

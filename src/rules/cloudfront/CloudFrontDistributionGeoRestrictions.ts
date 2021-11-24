/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * CloudFront distributions may require Geo restrictions
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.distributionConfig
      );
      if (distributionConfig.restrictions == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else {
        const restrictions = Stack.of(node).resolve(
          distributionConfig.restrictions
        );
        const geoRestrictions = Stack.of(node).resolve(
          restrictions.geoRestriction
        );
        const restrictionType = NagRules.resolveIfPrimitive(
          node,
          geoRestrictions.restrictionType
        );
        if (restrictionType == 'none') {
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

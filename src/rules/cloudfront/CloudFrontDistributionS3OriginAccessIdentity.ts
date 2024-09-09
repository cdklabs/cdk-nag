/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStreamingDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * CloudFront distributions use an origin access identity for S3 origins
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnStreamingDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.streamingDistributionConfig
      );
      const resolvedOrigin = Stack.of(node).resolve(
        distributionConfig.s3Origin
      );
      if (resolvedOrigin.originAccessIdentity.replace(/\s/g, '').length == 0) {
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

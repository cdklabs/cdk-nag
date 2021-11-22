/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import {
  CfnDistribution,
  CfnStreamingDistribution,
} from '@aws-cdk/aws-cloudfront';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * CloudFront distributions use an origin access identity for S3 origins
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.distributionConfig
      );
      if (distributionConfig.origins != undefined) {
        const origins = Stack.of(node).resolve(distributionConfig.origins);
        for (const origin of origins) {
          const resolvedOrigin = Stack.of(node).resolve(origin);
          const resolvedDomainName = Stack.of(node).resolve(
            resolvedOrigin.domainName
          );
          const s3Regex =
            /^.+\.s3(?:-website)?(?:\..+)?(?:(?:\.amazonaws\.com(?:\.cn)?)|(?:\.c2s\.ic\.gov)|(?:\.sc2s\.sgov\.gov))$/;
          if (s3Regex.test(resolvedDomainName)) {
            if (resolvedOrigin.s3OriginConfig == undefined) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
            const resolvedConfig = Stack.of(node).resolve(
              resolvedOrigin.s3OriginConfig
            );
            if (
              resolvedConfig.originAccessIdentity == undefined ||
              resolvedConfig.originAccessIdentity.replace(/\s/g, '').length == 0
            ) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnStreamingDistribution) {
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

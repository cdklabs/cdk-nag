/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * CloudFront distributions use an origin access control for S3 origins
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
          const originLogicalId = NagRules.resolveResourceFromIntrinsic(
            node,
            resolvedDomainName
          );
          for (const child of Stack.of(node).node.findAll()) {
            if (child instanceof CfnBucket) {
              const childLogicalId = NagRules.resolveResourceFromIntrinsic(
                child,
                child.ref
              );
              if (originLogicalId === childLogicalId) {
                const resolvedAccessControlId = Stack.of(node).resolve(
                  resolvedOrigin.originAccessControlId
                );
                const originAccessControlId =
                  NagRules.resolveResourceFromIntrinsic(
                    node,
                    resolvedAccessControlId
                  );
                if (originAccessControlId == undefined) {
                  return NagRuleCompliance.NON_COMPLIANT;
                }
                if (originAccessControlId.replace(/\s/g, '').length == 0) {
                  return NagRuleCompliance.NON_COMPLIANT;
                }
              }
            }
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);

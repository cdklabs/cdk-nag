/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      const publicAccessBlockConfiguration = Stack.of(node).resolve(
        node.publicAccessBlockConfiguration
      );
      if (
        publicAccessBlockConfiguration === undefined ||
        NagRules.resolveIfPrimitive(
          node,
          publicAccessBlockConfiguration.blockPublicPolicy
        ) !== true
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const accessControl = NagRules.resolveIfPrimitive(
        node,
        node.accessControl
      );
      const blockPublicAcls = NagRules.resolveIfPrimitive(
        node,
        publicAccessBlockConfiguration.blockPublicAcls
      );
      if (
        (accessControl === 'PublicRead' ||
          accessControl === 'PublicReadWrite') &&
        blockPublicAcls !== true
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

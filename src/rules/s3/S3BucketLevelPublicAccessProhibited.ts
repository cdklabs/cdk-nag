/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * S3 Buckets prohibit public access through bucket level settings
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      if (node.publicAccessBlockConfiguration == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const publicAccess = Stack.of(node).resolve(
        node.publicAccessBlockConfiguration
      );
      const blockPublicAcls = NagRules.resolveIfPrimitive(
        node,
        publicAccess.blockPublicAcls
      );
      const blockPublicPolicy = NagRules.resolveIfPrimitive(
        node,
        publicAccess.blockPublicPolicy
      );
      const ignorePublicAcls = NagRules.resolveIfPrimitive(
        node,
        publicAccess.ignorePublicAcls
      );
      const restrictPublicBuckets = NagRules.resolveIfPrimitive(
        node,
        publicAccess.restrictPublicBuckets
      );
      if (
        blockPublicAcls !== true ||
        blockPublicPolicy !== true ||
        ignorePublicAcls !== true ||
        restrictPublicBuckets !== true
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * S3 Buckets have default server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      if (node.bucketEncryption == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const encryption = Stack.of(node).resolve(node.bucketEncryption);
      if (encryption.serverSideEncryptionConfiguration == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const sse = Stack.of(node).resolve(
        encryption.serverSideEncryptionConfiguration
      );
      for (const rule of sse) {
        const defaultEncryption = Stack.of(node).resolve(
          rule.serverSideEncryptionByDefault
        );
        if (defaultEncryption == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const sseAlgorithm = resolveIfPrimitive(
          node,
          defaultEncryption.sseAlgorithm
        );
        if (
          sseAlgorithm.toLowerCase() != 'aes256' &&
          sseAlgorithm.toLowerCase() != 'aws:kms'
        ) {
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

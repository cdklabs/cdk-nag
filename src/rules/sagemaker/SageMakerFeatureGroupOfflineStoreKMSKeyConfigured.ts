/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnFeatureGroup } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance } from '../../nag-rules';
import { resolveIfNotIntrinsic } from '../../utils/resolve-if-not-intrinsic';

/**
 * SageMaker feature group offline stores are encrypted with a KMS key
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFeatureGroup) {
      const offlineStoreConfig = resolveIfNotIntrinsic(
        node,
        node.offlineStoreConfig
      );
      if (offlineStoreConfig == undefined) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      const s3StorageConfig = resolveIfNotIntrinsic(
        node,
        offlineStoreConfig.S3StorageConfig
      );
      if (!s3StorageConfig?.KmsKeyId) {
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

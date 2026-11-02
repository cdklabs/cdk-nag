/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnFeatureGroup } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * SageMaker feature group online stores with standard storage are encrypted with a KMS key
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFeatureGroup) {
      const onlineStoreConfig = NagRules.resolveIfNotIntrinsic(
        node,
        node.onlineStoreConfig
      );
      const enableOnlineStore = NagRules.resolveIfPrimitive(
        node,
        onlineStoreConfig?.EnableOnlineStore
      );
      const storageType = NagRules.resolveIfPrimitive(
        node,
        onlineStoreConfig?.StorageType
      );
      if (enableOnlineStore !== true || storageType === 'InMemory') {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      const securityConfig = NagRules.resolveIfNotIntrinsic(
        node,
        onlineStoreConfig.SecurityConfig
      );
      if (!securityConfig?.KmsKeyId) {
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

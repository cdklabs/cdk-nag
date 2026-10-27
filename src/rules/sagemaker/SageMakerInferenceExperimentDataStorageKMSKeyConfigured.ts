/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnInferenceExperiment } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * SageMaker inference experiments that capture data encrypt it with a customer managed KMS key
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnInferenceExperiment) {
      const dataStorageConfig = NagRules.resolveIfNotIntrinsic(
        node,
        node.dataStorageConfig
      );
      if (dataStorageConfig == undefined) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (!dataStorageConfig.kmsKey) {
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

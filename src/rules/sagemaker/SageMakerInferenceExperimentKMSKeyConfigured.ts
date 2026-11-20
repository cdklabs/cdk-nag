/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnInferenceExperiment } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * SageMaker inference experiments encrypt instance storage volumes with a customer managed KMS key
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnInferenceExperiment) {
      const kmsKey = Stack.of(node).resolve(node.kmsKey);
      if (!kmsKey) {
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

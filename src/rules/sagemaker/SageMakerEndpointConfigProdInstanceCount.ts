/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnEndpointConfig } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * SageMaker endpoint configurations have more than one initial instance for each instance-based production variant
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnEndpointConfig) {
      const productionVariants: any[] =
        NagRules.resolveIfNotIntrinsic(node, node.productionVariants) ?? [];
      const instanceBasedVariants = productionVariants
        .map((variant) => NagRules.resolveIfNotIntrinsic(node, variant))
        .filter(
          (variant) =>
            NagRules.resolveIfNotIntrinsic(node, variant?.serverlessConfig) ==
            undefined
        );
      if (instanceBasedVariants.length === 0) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      for (const variant of instanceBasedVariants) {
        const initialInstanceCount = NagRules.resolveIfPrimitive(
          node,
          variant.initialInstanceCount
        );
        if (initialInstanceCount == undefined || initialInstanceCount <= 1) {
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

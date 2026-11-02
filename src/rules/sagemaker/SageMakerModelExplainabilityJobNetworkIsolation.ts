/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnModelExplainabilityJobDefinition } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance } from '../../nag-rules';
import { resolveNestedPrimitive } from '../../utils/resolve-nested-primitive';

/**
 * SageMaker model explainability job definitions have network isolation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnModelExplainabilityJobDefinition) {
      const enableNetworkIsolation = resolveNestedPrimitive(
        node,
        node.networkConfig,
        'enableNetworkIsolation'
      );
      if (enableNetworkIsolation !== true) {
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

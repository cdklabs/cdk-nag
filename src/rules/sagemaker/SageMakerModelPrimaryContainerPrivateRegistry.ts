/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnModel } from 'aws-cdk-lib/aws-sagemaker';
import { usesPrivateRegistry } from './utils';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * SageMaker models pull the primary container image from a private registry in a VPC
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnModel) {
      const primaryContainer = Stack.of(node).resolve(node.primaryContainer);
      if (primaryContainer == undefined) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (!usesPrivateRegistry(node, primaryContainer)) {
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

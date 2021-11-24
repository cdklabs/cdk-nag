/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnNotebookInstance } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * SageMaker notebook instances have direct internet access disabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnNotebookInstance) {
      const directInternetAccess = resolveIfPrimitive(
        node,
        node.directInternetAccess
      );
      if (
        directInternetAccess == undefined ||
        directInternetAccess != 'Disabled'
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

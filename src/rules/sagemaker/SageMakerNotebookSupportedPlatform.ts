/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnNotebookInstance } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Platform identifiers that SageMaker AI still supports, per Security Hub control SageMaker.8
 */
const SUPPORTED_PLATFORM_IDENTIFIERS = ['notebook-al2023-v1'];

/**
 * SageMaker notebook instances run on a supported platform
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnNotebookInstance) {
      const platformIdentifier = NagRules.resolveIfPrimitive(
        node,
        node.platformIdentifier
      );
      if (
        platformIdentifier != undefined &&
        !SUPPORTED_PLATFORM_IDENTIFIERS.includes(platformIdentifier)
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

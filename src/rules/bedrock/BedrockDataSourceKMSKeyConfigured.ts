/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDataSource } from 'aws-cdk-lib/aws-bedrock';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Bedrock knowledge base data sources are encrypted with a customer managed KMS key
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDataSource) {
      const serverSideEncryptionConfiguration = Stack.of(node).resolve(
        node.serverSideEncryptionConfiguration
      );
      if (!serverSideEncryptionConfiguration?.kmsKeyArn) {
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

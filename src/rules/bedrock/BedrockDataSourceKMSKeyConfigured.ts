/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDataSource } from 'aws-cdk-lib/aws-bedrock';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Bedrock data sources use customer managed KMS keys for transient data during ingestion
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDataSource) {
      const encryption = Stack.of(node).resolve(
        node.serverSideEncryptionConfiguration
      );
      const kmsKey = Stack.of(node).resolve(encryption?.kmsKeyArn);
      if (
        kmsKey == undefined ||
        kmsKey === '' ||
        kmsKey.Ref === 'AWS::NoValue'
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

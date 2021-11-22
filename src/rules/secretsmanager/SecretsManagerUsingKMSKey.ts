/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnSecret } from '@aws-cdk/aws-secretsmanager';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * Secrets are encrypted with KMS Customer managed keys
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSecret) {
      const kmsKeyId = resolveIfPrimitive(node, node.kmsKeyId);
      if (kmsKeyId === undefined || kmsKeyId === 'aws/secretsmanager') {
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

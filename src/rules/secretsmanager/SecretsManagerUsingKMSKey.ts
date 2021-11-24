/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnSecret } from 'aws-cdk-lib/aws-secretsmanager';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Secrets are encrypted with KMS Customer managed keys
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSecret) {
      const kmsKeyId = NagRules.resolveIfPrimitive(node, node.kmsKeyId);
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnKey, KeySpec } from 'aws-cdk-lib/aws-kms';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * KMS Symmetric keys have automatic key rotation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnKey) {
      const keySpec = Stack.of(node).resolve(node.keySpec);
      if (keySpec == undefined || keySpec == KeySpec.SYMMETRIC_DEFAULT) {
        const enableKeyRotation = NagRules.resolveIfPrimitive(
          node,
          node.enableKeyRotation
        );
        if (enableKeyRotation !== true) {
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

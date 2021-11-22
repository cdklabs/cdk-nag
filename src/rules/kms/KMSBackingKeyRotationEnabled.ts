/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnKey, KeySpec } from '@aws-cdk/aws-kms';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * KMS Symmetric keys have automatic key rotation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnKey) {
      const keySpec = Stack.of(node).resolve(node.keySpec);
      if (keySpec == undefined || keySpec == KeySpec.SYMMETRIC_DEFAULT) {
        const enableKeyRotation = resolveIfPrimitive(
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

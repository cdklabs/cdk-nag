/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * S3 Buckets have object lock enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      const objectLockEnabled = NagRules.resolveIfPrimitive(
        node,
        node.objectLockEnabled
      );
      const objectLockConfiguration = Stack.of(node).resolve(
        node.objectLockConfiguration
      );
      if (
        objectLockEnabled !== true ||
        objectLockConfiguration === undefined ||
        NagRules.resolveIfPrimitive(
          node,
          objectLockConfiguration.objectLockEnabled
        ) !== 'Enabled'
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

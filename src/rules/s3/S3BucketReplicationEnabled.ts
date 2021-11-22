/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * S3 Buckets have replication enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      const replication = Stack.of(node).resolve(node.replicationConfiguration);
      if (replication === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const rules = Stack.of(node).resolve(replication.rules);
      let found = false;
      for (const rule of rules) {
        const resolvedRule = Stack.of(node).resolve(rule);
        if (resolvedRule.status === 'Enabled') {
          found = true;
          break;
        }
      }
      if (!found) {
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

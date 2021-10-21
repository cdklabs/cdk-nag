/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets have replication enabled - (Control IDs: AU-9(2), CM-6a, CM-9b, CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const replication = Stack.of(node).resolve(node.replicationConfiguration);
    if (replication === undefined) {
      return false;
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
      return false;
    }
  }
  return true;
}

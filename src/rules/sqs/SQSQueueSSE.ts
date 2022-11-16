/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnQueue } from 'aws-cdk-lib/aws-sqs';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * SQS queues have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnQueue) {
      const kmsMasterKeyId = Stack.of(node).resolve(node.kmsMasterKeyId);
      const sqsManagedSseEnabled = Stack.of(node).resolve(
        node.sqsManagedSseEnabled
      );
      if (kmsMasterKeyId === undefined && sqsManagedSseEnabled === false) {
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

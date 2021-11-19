/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnQueue } from 'aws-cdk-lib/aws-sqs';

/**
 * SQS queues have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnQueue) {
      const kmsMasterKeyId = Stack.of(node).resolve(node.kmsMasterKeyId);
      if (kmsMasterKeyId == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

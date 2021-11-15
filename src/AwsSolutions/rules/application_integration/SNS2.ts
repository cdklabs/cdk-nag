/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnTopic } from '@aws-cdk/aws-sns';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * SNS Topics have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnTopic) {
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

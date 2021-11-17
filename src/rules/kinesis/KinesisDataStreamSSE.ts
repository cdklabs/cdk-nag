/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnStream } from '@aws-cdk/aws-kinesis';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Kinesis Data Streams have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnStream) {
      const streamEncryption = Stack.of(node).resolve(node.streamEncryption);
      if (streamEncryption == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

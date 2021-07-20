/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStream } from '@aws-cdk/aws-kinesis';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Kinesis Data Streams have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnStream) {
    const streamEncryption = Stack.of(node).resolve(node.streamEncryption);
    if (streamEncryption == undefined) {
      return false;
    }
  }
  return true;
}

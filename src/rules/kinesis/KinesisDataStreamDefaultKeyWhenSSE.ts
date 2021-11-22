/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnStream } from '@aws-cdk/aws-kinesis';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * Kinesis Data Streams use the "aws/kinesis" key when server-sided encryption is enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnStream) {
      const streamEncryption = Stack.of(node).resolve(node.streamEncryption);
      if (streamEncryption !== undefined) {
        if (streamEncryption.keyId !== 'alias/aws/kinesis') {
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

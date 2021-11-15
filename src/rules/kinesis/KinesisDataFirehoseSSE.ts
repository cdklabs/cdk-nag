/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Kinesis Data Firehose delivery stream have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDeliveryStream) {
      const deliveryStreamEncryptionConfigurationInput = Stack.of(node).resolve(
        node.deliveryStreamEncryptionConfigurationInput
      );
      if (deliveryStreamEncryptionConfigurationInput == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

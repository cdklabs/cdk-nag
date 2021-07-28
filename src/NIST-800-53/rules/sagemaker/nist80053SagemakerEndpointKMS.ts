/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnEndpointConfig } from '@aws-cdk/aws-sagemaker';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Notebook instances utilize a KMS key - (Control IDs: SC-13, SC-28)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnEndpointConfig) {
    //Does this notebook have a KMS key ID?
    const kmsKey = Stack.of(node).resolve(node.kmsKeyId);
    if (kmsKey == undefined) {
      return false;
    }
  }
  return true;
}

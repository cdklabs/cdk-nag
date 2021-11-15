/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * SageMaker notebook instances utilize KMS keys for encryption at rest
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnNotebookInstance) {
    //Does this notebook have a KMS key ID?
    const kmsKey = Stack.of(node).resolve(node.kmsKeyId);
    if (kmsKey == undefined) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Notebook instances utilize a KMS key - (Control IDs: AC-4, SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnNotebookInstance) {
    //Does this notebook have a KMS key ID?
    const kmsKey = Stack.of(node).resolve(node.kmsKeyId);
    if (kmsKey == undefined) {
      return false;
    }
  }
  return true;
}

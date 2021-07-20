/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * SageMaker notebook instances use encrypted storage volumes
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnNotebookInstance) {
    const kmsKeyId = Stack.of(node).resolve(node.kmsKeyId);
    if (kmsKeyId == undefined) {
      return false;
    }
  }
  return true;
}

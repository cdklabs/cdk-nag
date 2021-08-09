/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * SageMaker notebook instances have direct internet access disabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnNotebookInstance) {
    const directInternetAccess = Stack.of(node).resolve(
      node.directInternetAccess
    );
    if (
      directInternetAccess == undefined ||
      directInternetAccess != 'Disabled'
    ) {
      return false;
    }
  }
  return true;
}

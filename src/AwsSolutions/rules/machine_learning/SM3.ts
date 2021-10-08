/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * SageMaker notebook instances have direct internet access disabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnNotebookInstance) {
    const directInternetAccess = resolveIfPrimitive(
      node,
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

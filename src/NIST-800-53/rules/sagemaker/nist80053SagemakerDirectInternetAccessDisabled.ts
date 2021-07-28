/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Notebook instances cannot directly access the internet - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnNotebookInstance) {
    //Does this notebook instance have internet access enabled?
    const internetAccess = Stack.of(node).resolve(node.directInternetAccess);
    if (internetAccess == undefined || internetAccess != "DISABLED") {
      return false;
    }
  }
  return true;
}

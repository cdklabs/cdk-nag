/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * SageMaker notebook instances utilize KMS keys for encryption at rest - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))
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

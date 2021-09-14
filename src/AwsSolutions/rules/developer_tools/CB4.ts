/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnProject } from '@aws-cdk/aws-codebuild';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Codebuild projects use an AWS KMS key for encryption
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnProject) {
    const encryptionKey = Stack.of(node).resolve(node.encryptionKey);
    if (encryptionKey == undefined || encryptionKey == 'alias/aws/s3') {
      return false;
    }
  }
  return true;
}

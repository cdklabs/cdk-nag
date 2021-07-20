/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnProject } from '@aws-cdk/aws-codebuild';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Codebuild projects use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnProject) {
    const environment = Stack.of(node).resolve(node.environment);
    const image = <string>Stack.of(node).resolve(environment.image);
    if (!image.startsWith('aws/codebuild/')) {
      return false;
    }
  }
  return true;
}

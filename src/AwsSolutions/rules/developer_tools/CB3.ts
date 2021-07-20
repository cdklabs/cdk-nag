/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnProject } from '@aws-cdk/aws-codebuild';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Codebuild projects have privileged mode disabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnProject) {
    const environment = Stack.of(node).resolve(node.environment);
    const privilegedMode = Stack.of(node).resolve(environment.privilegedMode);
    if (privilegedMode != undefined && privilegedMode) {
      return false;
    }
  }
  return true;
}

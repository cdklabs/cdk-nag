/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnProject } from '@aws-cdk/aws-codebuild';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Codebuild projects have privileged mode disabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnProject) {
    const environment = Stack.of(node).resolve(node.environment);
    const privilegedMode = resolveIfPrimitive(node, environment.privilegedMode);
    if (privilegedMode != undefined && privilegedMode) {
      return false;
    }
  }
  return true;
}

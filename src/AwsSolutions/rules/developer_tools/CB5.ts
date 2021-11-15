/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnProject } from '@aws-cdk/aws-codebuild';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Codebuild projects use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnProject) {
      const environment = Stack.of(node).resolve(node.environment);
      const image = resolveIfPrimitive(node, environment.image);
      if (!image.startsWith('aws/codebuild/')) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

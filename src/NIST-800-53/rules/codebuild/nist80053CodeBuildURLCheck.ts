/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnProject } from '@aws-cdk/aws-codebuild';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Codebuild projects utilize OAUTH - (Control IDs: SA-3(a))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnProject) {
    //Check for the presence of OAUTH
    const projectSource = Stack.of(node).resolve(node.source);
    const projectAuth = Stack.of(node).resolve(projectSource.auth);
    if (projectAuth == undefined) {
      return false;
    } else {
      const projectAuthType = projectAuth.type;
      if (projectAuthType != 'OAUTH') {
        return false;
      }
    }
  }
  return true;
}

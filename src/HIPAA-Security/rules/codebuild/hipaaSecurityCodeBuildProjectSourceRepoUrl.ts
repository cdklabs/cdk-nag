/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnProject } from '@aws-cdk/aws-codebuild';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Codebuild projects with a GitHub or BitBucket source repository utilize OAUTH - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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

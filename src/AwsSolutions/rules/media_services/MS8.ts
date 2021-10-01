/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnContainer } from '@aws-cdk/aws-mediastore';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Media Store containers define CORS policies
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnContainer) {
    const corsPolicy = Stack.of(node).resolve(node.corsPolicy);
    if (corsPolicy == undefined || corsPolicy.length == 0) {
      return false;
    }
  }
  return true;
}

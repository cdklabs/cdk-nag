/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnContainer } from '@aws-cdk/aws-mediastore';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Media Store containers define container policies
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnContainer) {
    const policy = Stack.of(node).resolve(node.policy);
    if (policy == undefined) {
      return false;
    }
  }
  return true;
}

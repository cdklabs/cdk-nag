/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnContainer } from '@aws-cdk/aws-mediastore';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Media Store containers define lifecycle policies
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnContainer) {
      const lifecyclePolicy = Stack.of(node).resolve(node.lifecyclePolicy);
      if (lifecyclePolicy == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

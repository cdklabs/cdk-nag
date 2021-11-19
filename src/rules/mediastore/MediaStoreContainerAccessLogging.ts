/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnContainer } from 'aws-cdk-lib/aws-mediastore';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Media Store containers have container access logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnContainer) {
      const accessLoggingEnabled = resolveIfPrimitive(
        node,
        node.accessLoggingEnabled
      );
      if (accessLoggingEnabled !== true) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

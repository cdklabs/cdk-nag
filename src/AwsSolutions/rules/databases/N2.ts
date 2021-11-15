/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBInstance } from '@aws-cdk/aws-neptune';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Neptune DB instances have Auto Minor Version Upgrade enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBInstance) {
      if (node.autoMinorVersionUpgrade == undefined) {
        return false;
      }
      const autoMinorVersionUpgrade = resolveIfPrimitive(
        node,
        node.autoMinorVersionUpgrade
      );
      if (!autoMinorVersionUpgrade) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

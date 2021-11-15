/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 *  RDS Aurora DB clusters have Deletion Protection enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      if (node.deletionProtection == undefined) {
        return false;
      }
      const deletionProtection = resolveIfPrimitive(
        node,
        node.deletionProtection
      );
      if (deletionProtection == false) {
        return false;
      }
      return true;
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Redshift clusters use custom user names vice the default (awsuser)
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const masterUsername = resolveIfPrimitive(node, node.masterUsername);
      if (masterUsername == 'awsuser') {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster } from 'aws-cdk-lib/aws-docdb';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Document DB clusters have the username and password stored in Secrets Manager
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      const masterUsername = resolveIfPrimitive(node, node.masterUsername);
      const masterUserPassword = resolveIfPrimitive(
        node,
        node.masterUserPassword
      );
      if (
        masterUsername.includes('{{resolve:secretsmanager') == false ||
        masterUserPassword.includes('{{resolve:secretsmanager') == false
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

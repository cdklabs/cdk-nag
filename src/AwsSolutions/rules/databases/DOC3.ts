/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster } from '@aws-cdk/aws-docdb';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Document DB clusters have the username and password stored in Secrets Manager
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    const masterUsername = Stack.of(node).resolve(node.masterUsername);
    const masterUserPassword = Stack.of(node).resolve(node.masterUserPassword);
    if (
      masterUsername.includes('{{resolve:secretsmanager') == false ||
      masterUserPassword.includes('{{resolve:secretsmanager') == false
    ) {
      return false;
    }
  }
  return true;
}

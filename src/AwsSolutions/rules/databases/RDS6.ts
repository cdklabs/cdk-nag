/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * RDS Aurora MySQL/PostgresSQL clusters have IAM Database Authentication enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBCluster) {
    if (node.engine.toLowerCase().includes('aurora')) {
      if (node.enableIamDatabaseAuthentication == undefined) {
        return false;
      }
      const iamAuth = Stack.of(node).resolve(node.enableIamDatabaseAuthentication);
      if (iamAuth == false) {
        return false;
      }
    }
  }

  return true;
}

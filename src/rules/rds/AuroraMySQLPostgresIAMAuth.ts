/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster } from 'aws-cdk-lib/aws-rds';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * RDS Aurora MySQL/PostgresSQL clusters have IAM Database Authentication enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      if (node.engine.toLowerCase().includes('aurora')) {
        if (node.enableIamDatabaseAuthentication == undefined) {
          return false;
        }
        const iamAuth = resolveIfPrimitive(
          node,
          node.enableIamDatabaseAuthentication
        );
        if (iamAuth == false) {
          return false;
        }
      }
    }

    return true;
  },
  'name',
  { value: parse(__filename).name }
);

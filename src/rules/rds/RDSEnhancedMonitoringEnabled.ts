/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * RDS DB instances have enhanced monitoring enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBInstance) {
      const enhancedMonitoring = resolveIfPrimitive(
        node,
        node.monitoringInterval
      );
      if (enhancedMonitoring == undefined || enhancedMonitoring <= 0) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

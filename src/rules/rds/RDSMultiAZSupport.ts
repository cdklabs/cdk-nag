/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 *  Non-Aurora RDS DB instances have multi-AZ support enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBInstance) {
      const multiAz = resolveIfPrimitive(node, node.multiAz);
      const engine = resolveIfPrimitive(node, node.engine);
      if (
        !multiAz &&
        (engine == undefined || !engine.toLowerCase().includes('aurora'))
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

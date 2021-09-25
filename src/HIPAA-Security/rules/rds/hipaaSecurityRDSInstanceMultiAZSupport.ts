/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 *  Non-Aurora RDS DB instances have multi-AZ support enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDBInstance) {
    const multiAz = Stack.of(node).resolve(node.multiAz);
    if (
      !multiAz &&
      (node.engine == undefined ||
        !node.engine.toLowerCase().includes('aurora'))
    ) {
      return false;
    }
  }
  return true;
}

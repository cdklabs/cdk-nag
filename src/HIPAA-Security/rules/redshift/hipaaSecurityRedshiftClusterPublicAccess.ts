/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Redshift clusters do not allow public access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const publicAccess = resolveIfPrimitive(node, node.publiclyAccessible);
    if (publicAccess === true) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-emr';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * EMR clusters have Kerberos enabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const kerberosAttributes = Stack.of(node).resolve(node.kerberosAttributes);
    if (kerberosAttributes == undefined) {
      return false;
    }
  }
  return true;
}

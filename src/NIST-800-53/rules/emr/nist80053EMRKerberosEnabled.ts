/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-emr';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * EMR clusters have Kerberos enabled - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6)
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * CloudTrail trails have encryption enabled - (Control ID: 164.312(a)(2)(iv), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnTrail) {
    const keyID = Stack.of(node).resolve(node.kmsKeyId);

    if (keyID == undefined) {
      return false;
    }
  }
  return true;
}

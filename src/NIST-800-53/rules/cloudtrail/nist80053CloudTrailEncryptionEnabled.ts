/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * The Cloud Trail resource does not have a KMS key ID or have encryption enabled - (Control ID: AU-9)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {

  if ( node instanceof CfnTrail ) {
    const keyID = Stack.of(node).resolve(node.kmsKeyId);

    if (keyID == undefined) {
      return false;
    }

  }
  return true;
}
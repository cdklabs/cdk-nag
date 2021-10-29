/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDatabase } from '@aws-cdk/aws-timestream';
import { CfnResource } from '@aws-cdk/core';

/**
 * Timestream databases use Customer Managed KMS Keys
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDatabase) {
    if (node.kmsKeyId === undefined) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLogGroup } from '@aws-cdk/aws-logs';
import { CfnResource } from '@aws-cdk/core';

/**
 * CloudWatch Log Groups are encrypted with customer managed keys
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnLogGroup) {
    if (node.kmsKeyId == undefined) {
      return false;
    }
  }
  return true;
}

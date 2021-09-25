/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnLogGroup } from '@aws-cdk/aws-logs';
import { IConstruct } from '@aws-cdk/core';

/**
 * CloudWatch Log Groups have an explicit retention period configured - (Control ID: 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnLogGroup) {
    if (node.retentionInDays == undefined) {
      return false;
    }
  }
  return true;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecret } from '@aws-cdk/aws-secretsmanager';
import { IConstruct } from '@aws-cdk/core';

/**
 * Secrets are encrypted with KMS Customer managed keys - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnSecret) {
    if (node.kmsKeyId === undefined || node.kmsKeyId === 'aws/secretsmanager') {
      return false;
    }
  }
  return true;
}

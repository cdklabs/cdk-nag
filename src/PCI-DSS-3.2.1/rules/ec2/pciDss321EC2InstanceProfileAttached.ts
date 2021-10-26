/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnInstance } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';

/**
 * EC2 instances have an instance profile attached - (Control IDs: 2.2, 7.1.1, 7.2.1)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnInstance) {
    if (node.iamInstanceProfile == undefined) {
      return false;
    }
  }
  return true;
}

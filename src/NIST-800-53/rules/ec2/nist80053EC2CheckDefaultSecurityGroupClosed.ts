/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnVPC } from '@aws-cdk/aws-ec2';
import { IConstruct } from '@aws-cdk/core';

/**
 * Is there a VPC defined?  If so, its default security group won't be closed.  - (AC-4, SC-7, SC-7(3)).
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnVPC) {
    return false;
  }
  return true;
}

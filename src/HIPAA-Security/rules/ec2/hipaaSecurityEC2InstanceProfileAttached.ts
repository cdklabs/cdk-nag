/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnInstance } from '@aws-cdk/aws-ec2';
import { IConstruct } from '@aws-cdk/core';

/**
 * EC2 instances have an instance profile attached - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnInstance) {
    if (node.iamInstanceProfile == undefined) {
      return false;
    }
  }
  return true;
}

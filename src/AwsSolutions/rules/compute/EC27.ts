/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Security Groups have descriptions
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnSecurityGroup) {
    const description = resolveIfPrimitive(node, node.groupDescription);
    if (description.length < 2) {
      return false;
    }
  }
  return true;
}

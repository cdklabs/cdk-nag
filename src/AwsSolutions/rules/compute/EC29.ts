/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnInstance } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * EC2 Instances outside of an ASG have Termination Protection enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnInstance) {
    const disableApiTermination = resolveIfPrimitive(
      node,
      node.disableApiTermination
    );
    if (disableApiTermination !== true) {
      return false;
    }
  }
  return true;
}

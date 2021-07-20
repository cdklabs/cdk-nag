/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnVolume } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EBS volumes have encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnVolume) {
    const encryption = Stack.of(node).resolve(node.encrypted);
    if (encryption == undefined || encryption == false) {
      return false;
    }
  }
  return true;
}

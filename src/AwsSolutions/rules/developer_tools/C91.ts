/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnEnvironmentEC2 } from '@aws-cdk/aws-cloud9';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Cloud9 instances use no-ingress EC2 instances with AWS Systems Manager
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnEnvironmentEC2) {
    const connectionType = Stack.of(node).resolve(node.connectionType);
    if (connectionType == undefined || connectionType != 'CONNECT_SSM') {
      return false;
    }
  }
  return true;
}

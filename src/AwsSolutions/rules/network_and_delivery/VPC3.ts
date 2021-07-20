/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnNetworkAcl, CfnNetworkAclEntry } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';

/**
 * VPCs do not implement network ACLs
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnNetworkAcl || node instanceof CfnNetworkAclEntry) {
    return false;
  }
  return true;
}

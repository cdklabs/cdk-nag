/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnNetworkAcl, CfnNetworkAclEntry } from 'aws-cdk-lib/aws-ec2';

/**
 * VPCs do not implement network ACLs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnNetworkAcl || node instanceof CfnNetworkAclEntry) {
      return false;
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnInstance } from 'aws-cdk-lib/aws-ec2';

/**
 * EC2 instances are created within VPCs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnInstance) {
      //If we are in a VPC, then we'll have a subnet
      const subnetId = Stack.of(node).resolve(node.subnetId);
      if (subnetId == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

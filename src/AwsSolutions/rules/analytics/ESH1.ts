/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ES domains are provisioned inside a VPC
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    const vpcOptions = Stack.of(node).resolve(node.vpcOptions);
    if (vpcOptions == undefined) {
      return false;
    }
    const subnetIds = Stack.of(node).resolve(vpcOptions.subnetIds);
    if (subnetIds == undefined || subnetIds.length == 0) {
      return false;
    }
  }
  return true;
}

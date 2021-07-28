/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Elasticsearch service domains are within VPCs - (Control IDs: AC-4, SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    //Is the VPC property set?
    const vpcOptions = Stack.of(node).resolve(node.vpcOptions);
    if (vpcOptions != undefined) {
      if (vpcOptions.SubnetIds == undefined || vpcOptions.SubnetIds.length == 0) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

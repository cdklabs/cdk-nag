/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains are within VPCs - (Control IDs: AC-4, SC-7, SC-7(3))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDomain) {
    //Is the VPC property set?
    const vpcOptions = Stack.of(node).resolve(node.vpcOptions);
    if (vpcOptions != undefined) {
      if (
        vpcOptions.subnetIds == undefined ||
        vpcOptions.subnetIds.length == 0
      ) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

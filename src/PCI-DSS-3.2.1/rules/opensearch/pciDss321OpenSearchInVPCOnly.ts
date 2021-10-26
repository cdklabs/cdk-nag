/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains are within VPCs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
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

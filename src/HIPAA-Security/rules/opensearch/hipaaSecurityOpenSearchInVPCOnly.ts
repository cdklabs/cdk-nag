/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains are within VPCs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDomain) {
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

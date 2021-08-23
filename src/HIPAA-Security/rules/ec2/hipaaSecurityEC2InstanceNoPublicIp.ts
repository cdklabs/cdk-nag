/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnInstance } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EC2 instances do not have public IPs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnInstance) {
    const networkInterfaces = Stack.of(node).resolve(node.networkInterfaces);
    if (networkInterfaces != undefined) {
      //Iterate through network interfaces, checking if public IPs are enabled
      for (const networkInterface of networkInterfaces) {
        const resolvedInterface = Stack.of(node).resolve(networkInterface);
        if (resolvedInterface.associatePublicIpAddress != undefined) {
          if (resolvedInterface.associatePublicIpAddress == true) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  }
  return true;
}

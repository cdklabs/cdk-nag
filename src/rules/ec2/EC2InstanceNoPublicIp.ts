/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnInstance } from 'aws-cdk-lib/aws-ec2';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * EC2 instances do not have public IPs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnInstance) {
      const networkInterfaces = Stack.of(node).resolve(node.networkInterfaces);
      if (networkInterfaces != undefined) {
        //Iterate through network interfaces, checking if public IPs are enabled
        for (const networkInterface of networkInterfaces) {
          const resolvedInterface = Stack.of(node).resolve(networkInterface);
          const associatePublicIpAddress = resolveIfPrimitive(
            node,
            resolvedInterface.associatePublicIpAddress
          );
          if (associatePublicIpAddress === true) {
            return false;
          }
        }
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

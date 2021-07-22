/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EC2 instances have detailed monitoring enabled - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/default-custom-security-groups.html
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnSecurityGroup) {
    const secGroupName = Stack.of(node).resolve(node.groupName);
    //is this a default security group?
    if (secGroupName == 'default') {
      const ingressRules = Stack.of(node).resolve(node.securityGroupIngress);
      const egressRules = Stack.of(node).resolve(node.securityGroupEgress);
      //Ensure there are no ingress or egress rules present
      if (ingressRules.length != 0 || egressRules.length != 0) {
        return false;
      }
    }

  }
  return true;
}

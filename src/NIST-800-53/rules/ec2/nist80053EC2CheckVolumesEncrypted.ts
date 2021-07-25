/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { CfnInstance } from '@aws-cdk/aws-ec2';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * EBS volumes are encrypted - (Control IDs: SC-13, SC-28)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnInstance || node instanceof CfnAutoScalingGroup) {
    if(checkVolumesEncrypted(node) == false){
      return false;
    }
  }
  return true;
}

/**
 * Helper function to identify if any volume is NOT encrypted
 * @param node the AWS cfn resource to check
 */
 function checkVolumesEncrypted (node: any){
  const ebsMappings = Stack.of(node).resolve(node.blockDeviceMappings);
  //Check if we have any EBS mappings in the first place
  if (ebsMappings != undefined) {
    //For each mapping, check if encryption is enabled
    for (const mapping of ebsMappings) {
        //Get EBS device
        const ebsDevice = Stack.of(node).resolve(mapping.ebs);
        if(ebsDevice.encryption == false){
          return false;
        }
    }
  }
  return true;
}

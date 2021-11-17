/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnInstance } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';

/**
 * EC2 instances have an instance profile attached
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnInstance) {
      if (node.iamInstanceProfile == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

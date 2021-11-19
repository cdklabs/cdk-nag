/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnVolume } from 'aws-cdk-lib/aws-ec2';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * EBS volumes have encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnVolume) {
      const encryption = resolveIfPrimitive(node, node.encrypted);
      if (encryption !== true) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

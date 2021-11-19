/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnEnvironmentEC2 } from 'aws-cdk-lib/aws-cloud9';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Cloud9 instances use no-ingress EC2 instances with AWS Systems Manager
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnEnvironmentEC2) {
      const connectionType = resolveIfPrimitive(node, node.connectionType);
      if (connectionType == undefined || connectionType != 'CONNECT_SSM') {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

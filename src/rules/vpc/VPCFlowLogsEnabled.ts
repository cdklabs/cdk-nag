/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnVPC, CfnFlowLog } from 'aws-cdk-lib/aws-ec2';
import { resolveResourceFromInstrinsic } from '../../nag-pack';

/**
 * VPCs have Flow Logs enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnVPC) {
      const vpcLogicalId = resolveResourceFromInstrinsic(node, node.ref);
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnFlowLog) {
          if (isMatchingCompliantFlowLog(child, vpcLogicalId)) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);

/**
 * Helper function to check whether a given Flow Log is compliant and associated with the given VPC
 * @param node the CfnFlowLog to check
 * returns whether the CfnFlowLog is compliant
 */
function isMatchingCompliantFlowLog(
  node: CfnFlowLog,
  vpcLogicalId: string
): boolean {
  const resourceLogicalId = resolveResourceFromInstrinsic(
    node,
    node.resourceId
  );
  if (node.resourceType === 'VPC' && resourceLogicalId === vpcLogicalId) {
    return true;
  }
  return false;
}

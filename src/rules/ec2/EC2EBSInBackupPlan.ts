/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBackupSelection } from 'aws-cdk-lib/aws-backup';
import { CfnVolume } from 'aws-cdk-lib/aws-ec2';
import { resolveResourceFromInstrinsic } from '../../nag-pack';

/**
 * EBS volumes are part of AWS Backup plan(s)
 * @param node the CfnResource to check
 */

export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnVolume) {
      const volumeLogicalId = resolveResourceFromInstrinsic(node, node.ref);
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnBackupSelection) {
          if (isMatchingSelection(child, volumeLogicalId)) {
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
 * Helper function to check whether the Backup Plan Selection contains the given volume
 * @param node the CfnBackupSelection to check
 * @param volumeLogicalId the Cfn Logical ID of the volume
 * returns whether the CfnBackupSelection contains the given volume
 */
function isMatchingSelection(
  node: CfnBackupSelection,
  volumeLogicalId: string
): boolean {
  const backupSelection = Stack.of(node).resolve(node.backupSelection);
  const resources = Stack.of(node).resolve(backupSelection.resources);
  if (Array.isArray(resources)) {
    for (const resource of resources) {
      const resolvedResource = JSON.stringify(Stack.of(node).resolve(resource));
      if (new RegExp(`${volumeLogicalId}(?![\\w])`).test(resolvedResource)) {
        return true;
      }
    }
  }
  return false;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBackupSelection } from '@aws-cdk/aws-backup';
import { CfnVolume } from '@aws-cdk/aws-ec2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * EBS volumes are part of AWS Backup plan(s) - (Control IDs: CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))
 * @param node the CfnResource to check
 */

export default function (node: CfnResource): boolean {
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
}

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

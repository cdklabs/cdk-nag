/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBackupSelection } from '@aws-cdk/aws-backup';
import { CfnFileSystem } from '@aws-cdk/aws-efs';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../nag-pack';

/**
 * EFSs are part of AWS Backup plan(s)
 * @param node the CfnResource to check
 */

export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnFileSystem) {
      const fileSystemLogicalId = resolveResourceFromInstrinsic(node, node.ref);
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnBackupSelection) {
          if (isMatchingSelection(child, fileSystemLogicalId)) {
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
 * Helper function to check whether the Backup Plan Selection contains the given File System
 * @param node the CfnBackupSelection to check
 * @param fileSystemLogicalId the Cfn Logical ID of the File System
 * returns whether the CfnBackupSelection contains the given File System
 */
function isMatchingSelection(
  node: CfnBackupSelection,
  fileSystemLogicalId: string
): boolean {
  const backupSelection = Stack.of(node).resolve(node.backupSelection);
  const resources = Stack.of(node).resolve(backupSelection.resources);
  if (Array.isArray(resources)) {
    for (const resource of resources) {
      const resolvedResource = JSON.stringify(Stack.of(node).resolve(resource));
      if (
        new RegExp(`${fileSystemLogicalId}(?![\\w])`).test(resolvedResource)
      ) {
        return true;
      }
    }
  }
  return false;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBackupSelection } from '@aws-cdk/aws-backup';
import { CfnTable } from '@aws-cdk/aws-dynamodb';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * DynamoDB tables are part of AWS Backup plan(s) - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B))
 * @param node the CfnResource to check
 */

export default function (node: CfnResource): boolean {
  if (node instanceof CfnTable) {
    const tableLogicalId = resolveResourceFromInstrinsic(node, node.ref);
    const tableName = Stack.of(node).resolve(node.tableName);
    let found = false;
    for (const child of Stack.of(node).node.findAll()) {
      if (child instanceof CfnBackupSelection) {
        if (isMatchingSelection(child, tableLogicalId, tableName)) {
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
 * Helper function to check whether the Backup Plan Selection contains the given Table
 * @param node the CfnBackupSelection to check
 * @param tableLogicalId the Cfn Logical ID of the table
 * @param tableName the name of the table
 * returns whether the CfnBackupSelection contains the given Table
 */
function isMatchingSelection(
  node: CfnBackupSelection,
  tableLogicalId: string,
  tableName: string | undefined
): boolean {
  const backupSelection = Stack.of(node).resolve(node.backupSelection);
  const resources = Stack.of(node).resolve(backupSelection.resources);
  if (Array.isArray(resources)) {
    for (const resource of resources) {
      const resolvedResource = JSON.stringify(Stack.of(node).resolve(resource));
      if (
        new RegExp(`${tableLogicalId}(?![\\w])`).test(resolvedResource) ||
        (tableName != undefined &&
          new RegExp(`table\/${tableName}(?![\\w\\-_\\.])`).test(
            resolvedResource
          ))
      ) {
        return true;
      }
    }
  }
  return false;
}

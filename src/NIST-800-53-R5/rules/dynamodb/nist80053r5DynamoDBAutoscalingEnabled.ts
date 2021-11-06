/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnScalableTarget } from '@aws-cdk/aws-applicationautoscaling';
import { CfnTable, BillingMode } from '@aws-cdk/aws-dynamodb';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * Provisioned capacity DynamoDB tables have auto-scaling enabled on their indexes - (Control IDs: CP-1a.1(b), CP-1a.2, CP-2a, CP-2a.6, CP-2a.7, CP-2d, CP-2e, CP-2(5), CP-2(6), CP-6(2), CP-10, SC-5(2), SC-6, SC-22, SC-36, SI-13(5))
 * @param node the CfnResource to check
 */

export default function (node: CfnResource): boolean {
  if (node instanceof CfnTable) {
    if (
      resolveResourceFromInstrinsic(node, node.billingMode) !==
      BillingMode.PAY_PER_REQUEST
    ) {
      const indexWriteMatches = [''];
      const indexReadMatches = [''];
      const tableLogicalId = resolveResourceFromInstrinsic(node, node.ref);
      const tableName = Stack.of(node).resolve(node.tableName);
      const globalSecondaryIndexes = Stack.of(node).resolve(
        node.globalSecondaryIndexes
      );
      if (Array.isArray(globalSecondaryIndexes)) {
        globalSecondaryIndexes.forEach((gsi) => {
          const resolvedGsi = Stack.of(node).resolve(gsi);
          indexWriteMatches.push(resolvedGsi.indexName);
          indexReadMatches.push(resolvedGsi.indexName);
        });
      }
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnScalableTarget) {
          const writeMatchIndex = isMatchingScalableTarget(
            child,
            'WriteCapacityUnits',
            tableLogicalId,
            tableName,
            indexWriteMatches
          );
          if (writeMatchIndex !== -1) {
            indexWriteMatches.splice(writeMatchIndex, 1);
            continue;
          }
          const readMatchIndex = isMatchingScalableTarget(
            child,
            'ReadCapacityUnits',
            tableLogicalId,
            tableName,
            indexReadMatches
          );
          if (readMatchIndex !== -1) {
            indexReadMatches.splice(readMatchIndex, 1);
          }
        }
      }
      if (indexWriteMatches.length != 0 || indexReadMatches.length != 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Helper function to check whether the CfnScalableTarget is related to the given Table index
 * @param node the CfnScalableTarget to check
 * @param dimension the dimension of the CfnScalableTarget to check
 * @param tableLogicalId the Cfn Logical ID of the table
 * @param tableName the name of the table
 * @param indexNames the names of the indexes to check against
 * returns the location in the indexNames array of the matching index or -1 if no match is found
 */
function isMatchingScalableTarget(
  node: CfnScalableTarget,
  dimension: string,
  tableLogicalId: string,
  tableName: string | undefined,
  indexNames: string[]
): number {
  if (node.serviceNamespace === 'dynamodb') {
    let scalableDimension = '';
    const resourceId = JSON.stringify(Stack.of(node).resolve(node.resourceId));
    for (let i = 0; i < indexNames.length; i++) {
      const regexes = Array<string>();
      const indexName = indexNames[i];
      if (indexName === '') {
        regexes.push(`${tableLogicalId}.*`);
        if (tableName !== undefined) {
          regexes.push(`${tableName}.*`);
        }
        scalableDimension = `dynamodb:table:${dimension}`;
      } else {
        regexes.push(`${tableLogicalId}.*index\/${indexName}(?![\\w\\-_\\.])`);
        if (tableName !== undefined) {
          regexes.push(`${tableName}.*index\/${indexName}(?![\\w\\-_\\.])`);
        }
        scalableDimension = `dynamodb:index:${dimension}`;
      }
      const regex = new RegExp(regexes.join('|'), 'gm');
      if (
        node.scalableDimension === scalableDimension &&
        regex.test(resourceId)
      ) {
        return i;
      }
    }
  }
  return -1;
}

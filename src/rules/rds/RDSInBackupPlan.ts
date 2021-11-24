/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBackupSelection } from 'aws-cdk-lib/aws-backup';
import { CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * RDS DB Instances are part of AWS Backup plan(s)
 * @param node the CfnResource to check
 */

export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBInstance) {
      const dbLogicalId = NagRules.resolveResourceFromInstrinsic(
        node,
        node.ref
      );
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnBackupSelection) {
          if (isMatchingSelection(child, dbLogicalId)) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

/**
 * Helper function to check whether the Backup Plan Selection contains the given database instance
 * @param node the CfnBackupSelection to check
 * @param dbLogicalId the Cfn Logical ID of the database instance
 * returns whether the CfnBackupSelection contains the given database instance
 */
function isMatchingSelection(
  node: CfnBackupSelection,
  dbLogicalId: string
): boolean {
  const backupSelection = Stack.of(node).resolve(node.backupSelection);
  const resources = Stack.of(node).resolve(backupSelection.resources);
  if (Array.isArray(resources)) {
    for (const resource of resources) {
      const resolvedResource = JSON.stringify(Stack.of(node).resolve(resource));
      if (new RegExp(`${dbLogicalId}(?![\\w])`).test(resolvedResource)) {
        return true;
      }
    }
  }
  return false;
}

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBackupVault } from '@aws-cdk/aws-backup';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Backup vaults are configured with notifications
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBackupVault) {
      if (!node.notifications) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      // should have a notifications object specified
      const notifications = Stack.of(node).resolve(node.notifications);
      if (!notifications) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      // should have a notifications topic specified
      const topicArn = Stack.of(node).resolve(notifications.snsTopicArn);
      if (topicArn == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      // should have events specified
      const events = Stack.of(node).resolve(notifications.backupVaultEvents);
      if (!events) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      // should notify on failure or expired
      if (events.constructor.name === 'Array') {
        const eventsArr = events as string[];
        if (
          eventsArr.indexOf('BACKUP_JOB_FAILED') === -1 ||
          eventsArr.indexOf('BACKUP_JOB_EXPIRED') === -1
        ) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }

      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

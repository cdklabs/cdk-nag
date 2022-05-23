/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  BackupVault,
  BackupVaultEvents,
  CfnBackupVault,
} from '@aws-cdk/aws-backup';
import { Topic } from '@aws-cdk/aws-sns';
import { Aspects, Stack } from '@aws-cdk/core';
import BackupVaultNotifications from '../../src/rules/backup/BackupVaultNotifications';
import { TestPack, TestType, validateStack } from './utils';

const testPack = new TestPack([BackupVaultNotifications], { verbose: true });
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Backup', () => {
  describe('BackupVaultNotifications: AWS Backup vaults should have notifications configured for backup failures and expirations', () => {
    const ruleId = 'BackupVaultNotifications';
    test('Noncompliance 1 - no notifications object', () => {
      new CfnBackupVault(stack, 'rVault', {
        backupVaultName: 'test-vault',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2 - notifications with arn, missing events', () => {
      new CfnBackupVault(stack, 'rVault', {
        backupVaultName: 'test-vault',
        notifications: {
          snsTopicArn: 'arn:sns:topic',
          backupVaultEvents: [],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3 - missing expired event', () => {
      new CfnBackupVault(stack, 'rVault', {
        backupVaultName: 'test-vault',
        notifications: {
          snsTopicArn: 'arn:sns:topic',
          backupVaultEvents: ['BACKUP_JOB_FAILED'],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3 - missing failed event', () => {
      new CfnBackupVault(stack, 'rVault', {
        backupVaultName: 'test-vault',
        notifications: {
          snsTopicArn: 'arn:sns:topic',
          backupVaultEvents: ['BACKUP_JOB_EXPIRED'],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4 - L2 - missing topic', () => {
      new BackupVault(stack, 'rVault', {
        notificationEvents: [
          BackupVaultEvents.BACKUP_JOB_FAILED,
          BackupVaultEvents.BACKUP_JOB_EXPIRED,
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5 - L2 - missing events', () => {
      new BackupVault(stack, 'rVault', {
        notificationTopic: new Topic(stack, 'rTopic'),
        notificationEvents: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 6 - L2 - missing failed event', () => {
      new BackupVault(stack, 'rVault', {
        notificationTopic: new Topic(stack, 'rTopic'),
        notificationEvents: [BackupVaultEvents.BACKUP_JOB_EXPIRED],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 7 - L2 - missing expired event', () => {
      new BackupVault(stack, 'rVault', {
        notificationTopic: new Topic(stack, 'rTopic'),
        notificationEvents: [BackupVaultEvents.BACKUP_JOB_FAILED],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1 - L1', () => {
      new CfnBackupVault(stack, 'rVault', {
        backupVaultName: 'test-vault',
        notifications: {
          snsTopicArn: 'arn:sns:topic',
          backupVaultEvents: ['BACKUP_JOB_FAILED', 'BACKUP_JOB_EXPIRED'],
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 2 - L2', () => {
      new BackupVault(stack, 'rVault', {
        notificationTopic: new Topic(stack, 'rTopic'),
        notificationEvents: [
          BackupVaultEvents.BACKUP_JOB_FAILED,
          BackupVaultEvents.BACKUP_JOB_EXPIRED,
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

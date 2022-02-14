/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { BackupPlan, BackupResource } from 'aws-cdk-lib/aws-backup';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { FileSystem } from 'aws-cdk-lib/aws-efs';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { EFSEncrypted, EFSInBackupPlan } from '../../src/rules/efs';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([EFSEncrypted, EFSInBackupPlan]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Elastic File System (Amazon EFS)', () => {
  describe('EFSEncrypted: Elastic File Systems are configured for encryption at rest', () => {
    const ruleId = 'EFSEncrypted';
    test('Noncompliance 1', () => {
      new FileSystem(stack, 'rEFS', {
        vpc: new Vpc(stack, 'rVpc'),
        encrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new FileSystem(stack, 'rEFS', {
        vpc: new Vpc(stack, 'rVpc'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EFSInBackupPlan: EFSs are part of AWS Backup plan(s)', () => {
    const ruleId = 'EFSInBackupPlan';
    test('Noncompliance 1', () => {
      new FileSystem(stack, 'rEFS', {
        vpc: new Vpc(stack, 'rVpc'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new FileSystem(stack, 'rEFS', {
        vpc: new Vpc(stack, 'rVpc'),
      });
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan').addSelection(
        'Selection',
        {
          resources: [
            BackupResource.fromEfsFileSystem(
              new FileSystem(stack, 'rEFS2', {
                vpc: new Vpc(stack, 'rVpc2'),
              })
            ),
          ],
        }
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan').addSelection(
        'Selection',
        {
          resources: [
            BackupResource.fromEfsFileSystem(
              new FileSystem(stack, 'rEFS', {
                vpc: new Vpc(stack, 'rVpc'),
              })
            ),
          ],
        }
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

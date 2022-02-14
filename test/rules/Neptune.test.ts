/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-neptune';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  NeptuneClusterAutomaticMinorVersionUpgrade,
  NeptuneClusterBackupRetentionPeriod,
  NeptuneClusterEncryptionAtRest,
  NeptuneClusterIAMAuth,
  NeptuneClusterMultiAZ,
} from '../../src/rules/neptune';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  NeptuneClusterAutomaticMinorVersionUpgrade,
  NeptuneClusterBackupRetentionPeriod,
  NeptuneClusterEncryptionAtRest,
  NeptuneClusterIAMAuth,
  NeptuneClusterMultiAZ,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Neptune', () => {
  describe('NeptuneClusterAutomaticMinorVersionUpgrade: Neptune DB instances have Auto Minor Version Upgrade enabled', () => {
    const ruleId = 'NeptuneClusterAutomaticMinorVersionUpgrade';
    test('Noncompliance 1', () => {
      new CfnDBInstance(stack, 'rDatabaseInstance', {
        dbInstanceClass: 'db.r4.2xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBInstance(stack, 'rDatabaseInstance', {
        dbInstanceClass: 'db.r4.2xlarge',
        autoMinorVersionUpgrade: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('NeptuneClusterBackupRetentionPeriod: Neptune DB clusters have a reasonable minimum backup retention period configured', () => {
    const ruleId = 'NeptuneClusterBackupRetentionPeriod';
    test('Noncompliance 1', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', {
        backupRetentionPeriod: 7,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('NeptuneClusterEncryptionAtRest: Neptune DB clusters have encryption at rest enabled', () => {
    const ruleId = 'NeptuneClusterEncryptionAtRest';
    test('Noncompliance 1', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', {
        storageEncrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', { storageEncrypted: true });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('NeptuneClusterIAMAuth: Neptune DB clusters have IAM Database Authentication enabled', () => {
    const ruleId = 'NeptuneClusterIAMAuth';
    test('Noncompliance 1', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', {
        iamAuthEnabled: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('NeptuneClusterMultiAZ: Neptune DB clusters are deployed in a Multi-AZ configuration', () => {
    const ruleId = 'NeptuneClusterMultiAZ';
    test('Noncompliance 1', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', {
        availabilityZones: ['us-east-1a'],
        dbSubnetGroupName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', {
        availabilityZones: ['us-east-1a', 'us-east-1b'],
        dbSubnetGroupName: 'foo',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDBCluster, DatabaseCluster } from '@aws-cdk/aws-docdb';
import {
  InstanceType,
  InstanceClass,
  InstanceSize,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { Aspects, Duration, SecretValue, Stack } from '@aws-cdk/core';
import {
  DocumentDBClusterBackupRetentionPeriod,
  DocumentDBClusterEncryptionAtRest,
  DocumentDBClusterLogExports,
  DocumentDBClusterNonDefaultPort,
  DocumentDBCredentialsInSecretsManager,
} from '../../src/rules/documentdb';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  DocumentDBClusterBackupRetentionPeriod,
  DocumentDBClusterEncryptionAtRest,
  DocumentDBClusterLogExports,
  DocumentDBClusterNonDefaultPort,
  DocumentDBCredentialsInSecretsManager,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon DocumentDB (with MongoDB compatibility)', () => {
  describe('DocumentDBClusterEncryptionAtRest: Document DB clusters have encryption at rest enabled', () => {
    const ruleId = 'DocumentDBClusterEncryptionAtRest';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
        storageEncrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
        storageEncrypted: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('DocumentDBClusterNonDefaultPort: Document DB clusters do not use the default endpoint port', () => {
    const ruleId = 'DocumentDBClusterNonDefaultPort';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
        port: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('DocumentDBCredentialsInSecretsManager: Document DB clusters have the username and password stored in Secrets Manager', () => {
    const ruleId = 'DocumentDBCredentialsInSecretsManager';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: 'foo',
          password: SecretValue.secretsManager('bar'),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('DocumentDBClusterBackupRetentionPeriod: Document DB clusters have a reasonable minimum backup retention period configured', () => {
    const ruleId = 'DocumentDBClusterBackupRetentionPeriod';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        backup: { retention: Duration.days(7) },
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('DocumentDBClusterLogExports: Document DB clusters have authenticate, createIndex, and dropCollection Log Exports enabled', () => {
    const ruleId = 'DocumentDBClusterLogExports';
    test('Noncompliance 1: expect findings for all logs', () => {
      new DatabaseCluster(stack, 'rDatabaseCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(stack, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      validateStack(
        stack,
        `${ruleId}[LogExport::authenticate]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::createIndex]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::dropCollection]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Noncompliance 2: expect findings for only `createIndex` logs', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', {
        masterUsername: SecretValue.secretsManager('foo').toString(),
        masterUserPassword: SecretValue.secretsManager('bar').toString(),
        enableCloudwatchLogsExports: ['authenticate', 'dropCollection'],
      });
      validateStack(
        stack,
        `${ruleId}\\[LogExport::authenticate\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}\\[LogExport::dropCollection\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::createIndex]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Compliance', () => {
      new CfnDBCluster(stack, 'rDatabaseCluster', {
        masterUsername: SecretValue.secretsManager('foo').toString(),
        masterUserPassword: SecretValue.secretsManager('bar').toString(),
        enableCloudwatchLogsExports: [
          'authenticate',
          'createIndex',
          'dropCollection',
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

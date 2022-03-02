/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { BackupPlan, BackupResource } from '@aws-cdk/aws-backup';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  AuroraMysqlEngineVersion,
  AuroraPostgresEngineVersion,
  CfnDBInstance,
  DatabaseCluster,
  DatabaseClusterEngine,
  DatabaseInstance,
  DatabaseInstanceEngine,
  MariaDbEngineVersion,
  PostgresEngineVersion,
  SqlServerEngineVersion,
  MysqlEngineVersion,
  OracleEngineVersion,
  CfnDBCluster,
  CfnDBSecurityGroup,
  CfnDBSecurityGroupIngress,
} from '@aws-cdk/aws-rds';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  AuroraMySQLBacktrack,
  AuroraMySQLLogging,
  AuroraMySQLPostgresIAMAuth,
  RDSAutomaticMinorVersionUpgradeEnabled,
  RDSEnhancedMonitoringEnabled,
  RDSInBackupPlan,
  RDSInstanceBackupEnabled,
  RDSInstanceDeletionProtectionEnabled,
  RDSInstancePublicAccess,
  RDSLoggingEnabled,
  RDSMultiAZSupport,
  RDSNonDefaultPort,
  RDSRestrictedInbound,
  RDSStorageEncrypted,
} from '../../src/rules/rds';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  AuroraMySQLBacktrack,
  AuroraMySQLLogging,
  AuroraMySQLPostgresIAMAuth,
  RDSAutomaticMinorVersionUpgradeEnabled,
  RDSEnhancedMonitoringEnabled,
  RDSInBackupPlan,
  RDSInstanceBackupEnabled,
  RDSInstanceDeletionProtectionEnabled,
  RDSInstancePublicAccess,
  RDSLoggingEnabled,
  RDSMultiAZSupport,
  RDSNonDefaultPort,
  RDSRestrictedInbound,
  RDSStorageEncrypted,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Relational Database Service (RDS) and Amazon Aurora', () => {
  describe('AuroraMySQLBacktrack: RDS Aurora MySQL clusters have Backtrack enabled', () => {
    const ruleId = 'AuroraMySQLBacktrack';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(stack, 'rVpc') },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBCluster(stack, 'rDbCluster', {
        engine: 'aurora',
        backtrackWindow: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('AuroraMySQLLogging: RDS Aurora MySQL serverless clusters have audit, error, general, and slowquery Log Exports enabled', () => {
    const ruleId = 'AuroraMySQLLogging';
    test("Noncompliance 1: expect findings for only 'general' and 'slowquery' logs", () => {
      new CfnDBCluster(stack, 'rDbCluster', {
        engine: 'aurora-mysql',
        engineMode: 'serverless',
        scalingConfiguration: {
          maxCapacity: 42,
          minCapacity: 7,
        },
        enableCloudwatchLogsExports: ['audit', 'error'],
      });
      validateStack(
        stack,
        `${ruleId}\\[LogExport::audit\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}\\[LogExport::error\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::general]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::slowquery]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Noncompliance 1: expect findings for all logs', () => {
      new CfnDBCluster(stack, 'rDbCluster', {
        engine: 'aurora-mysql',
        engineMode: 'serverless',
        scalingConfiguration: {
          maxCapacity: 42,
          minCapacity: 7,
        },
      });
      validateStack(
        stack,
        `${ruleId}[LogExport::audit]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::error]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::general]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::slowquery]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Compliance', () => {
      new CfnDBCluster(stack, 'rDbCluster', {
        engine: 'aurora-postgresql',
        engineMode: 'serverless',
        scalingConfiguration: {
          maxCapacity: 42,
          minCapacity: 7,
        },
      });
      new CfnDBCluster(stack, 'rDbCluster2', {
        engine: 'aurora-mysql',
        engineMode: 'serverless',
        scalingConfiguration: {
          maxCapacity: 42,
          minCapacity: 7,
        },
        enableCloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery'],
      });
      new CfnDBCluster(stack, 'rDbCluster3', {
        engine: 'aurora-mysql',
      });
      new DatabaseCluster(stack, 'rDbCluster4', {
        engine: DatabaseClusterEngine.auroraPostgres({
          version: AuroraPostgresEngineVersion.VER_10_4,
        }),
        instanceProps: { vpc: new Vpc(stack, 'rVpc') },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('AuroraMySQLPostgresIAMAuth: RDS Aurora MySQL/PostgresSQL clusters have IAM Database Authentication enabled', () => {
    const ruleId = 'AuroraMySQLPostgresIAMAuth';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(stack, 'rVpc') },
        iamAuthentication: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const vpc = new Vpc(stack, 'rVpc');
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        iamAuthentication: true,
        instanceProps: { vpc: vpc },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSAutomaticMinorVersionUpgradeEnabled: RDS DB instances have automatic minor version upgrades enabled', () => {
    const ruleId = 'RDSAutomaticMinorVersionUpgradeEnabled';
    test('Noncompliance 1', () => {
      new CfnDBInstance(stack, 'rDbInstance', {
        dbInstanceClass: 'db.t3.micro',
        autoMinorVersionUpgrade: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBInstance(stack, 'rDbInstance', {
        dbInstanceClass: 'db.t3.micro',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSEnhancedMonitoringEnabled: RDS DB instances have enhanced monitoring enabled', () => {
    const ruleId = 'RDSEnhancedMonitoringEnabled';
    test('Noncompliance 1', () => {
      new CfnDBInstance(stack, 'rDbInstance', {
        dbInstanceClass: 'db.t3.micro',
        monitoringInterval: 0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBInstance(stack, 'rDbInstance', {
        dbInstanceClass: 'db.t3.micro',
        monitoringInterval: 15,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSInBackupPlan: RDS DB Instances are part of AWS Backup plan(s)', () => {
    const ruleId = 'RDSInBackupPlan';
    test('Noncompliance 1', () => {
      new CfnDBInstance(stack, 'rDbInstance', {
        dbInstanceClass: 'db.t3.micro',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan').addSelection(
        'Selection',
        {
          resources: [
            BackupResource.fromRdsDatabaseInstance(
              new DatabaseInstance(stack, 'rDbInstance2', {
                engine: DatabaseInstanceEngine.postgres({
                  version: PostgresEngineVersion.VER_13_2,
                }),
                vpc: new Vpc(stack, 'rVpc2'),
              })
            ),
          ],
        }
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSInstanceBackupEnabled: RDS DB instances have backup enabled', () => {
    const ruleId = 'RDSInstanceBackupEnabled';
    test('Noncompliance 1', () => {
      new CfnDBInstance(stack, 'rDbInstance', {
        dbInstanceClass: 'db.t3.micro',
        backupRetentionPeriod: 0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBInstance(stack, 'rDbInstance', {
        dbInstanceClass: 'db.t3.micro',
      });
      new CfnDBInstance(stack, 'rDbInstance2', {
        dbInstanceClass: 'db.t3.micro',
        backupRetentionPeriod: 15,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSInstanceDeletionProtectionEnabled: RDS DB instances and Aurora DB clusters have Deletion Protection enabled', () => {
    const ruleId = 'RDSInstanceDeletionProtectionEnabled';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(stack, 'rVpc') },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: new Vpc(stack, 'rVpc'),
        deletionProtection: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const vpc = new Vpc(stack, 'rVpc');
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: vpc },
        deletionProtection: true,
      });
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
        deletionProtection: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSInstancePublicAccess: RDS DB instances are not publicly accessible', () => {
    const ruleId = 'RDSInstancePublicAccess';
    test('Noncompliance 1', () => {
      const vpc = new Vpc(stack, 'rVpc');
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
        publiclyAccessible: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const vpc2 = new Vpc(stack, 'rVpc');
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc2,
        publiclyAccessible: false,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSLoggingEnabled: RDS DB instances are configured to export all possible log types to CloudWatch', () => {
    const ruleId = 'RDSLoggingEnabled';
    test('Noncompliance 1: expect finding for all logs for MariaDB based engines', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.mariaDb({
          version: MariaDbEngineVersion.VER_10_2,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc'),
      });
      const needed = ['audit', 'error', 'general', 'slowquery'];
      needed.forEach((log) => {
        validateStack(
          stack,
          `${ruleId}[LogExport::${log}]`,
          TestType.NON_COMPLIANCE
        );
      });
    });
    test('Noncompliance 2: expect finding for all logs for PostgreSQL based engines', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_10,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc'),
      });
      const needed = ['postgresql', 'upgrade'];
      needed.forEach((log) => {
        validateStack(
          stack,
          `${ruleId}[LogExport::${log}]`,
          TestType.NON_COMPLIANCE
        );
      });
    });
    test("Noncompliance 3: expect finding for only 'agent' logs for SQL Server based engines", () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.sqlServerWeb({
          version: SqlServerEngineVersion.VER_11,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc'),
        cloudwatchLogsExports: ['error'],
      });
      validateStack(
        stack,
        `${ruleId}\\[LogExport::error\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::agent]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Noncompliance 4: expect finding for all logs for MySQL based engines', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_8_0_25,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc'),
      });
      const needed = ['audit', 'error', 'general', 'slowquery'];
      needed.forEach((log) => {
        validateStack(
          stack,
          `${ruleId}[LogExport::${log}]`,
          TestType.NON_COMPLIANCE
        );
      });
    });
    test('Noncompliance 5: expect finding for all logs for Oracle based engines', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.oracleEe({
          version: OracleEngineVersion.VER_19_0_0_0_2021_04_R1,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc'),
      });
      const needed = ['audit', 'alert', 'listener', 'oemagent', 'trace'];
      needed.forEach((log) => {
        validateStack(
          stack,
          `${ruleId}[LogExport::${log}]`,
          TestType.NON_COMPLIANCE
        );
      });
    });
    test('Compliance', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.mariaDb({
          version: MariaDbEngineVersion.VER_10_2,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc'),
        cloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery'],
      });

      new DatabaseInstance(stack, 'rDbInstance2', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_11,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc2'),
        cloudwatchLogsExports: ['postgresql', 'upgrade'],
      });

      new DatabaseInstance(stack, 'rDbInstance3', {
        engine: DatabaseInstanceEngine.sqlServerEe({
          version: SqlServerEngineVersion.VER_11,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc3'),
        cloudwatchLogsExports: ['agent', 'error'],
      });

      new DatabaseInstance(stack, 'rDbInstance4', {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_8_0_25,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc4'),
        cloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery'],
      });

      new DatabaseInstance(stack, 'rDbInstance5', {
        engine: DatabaseInstanceEngine.oracleSe2({
          version: OracleEngineVersion.VER_19_0_0_0_2021_04_R1,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc5'),
        cloudwatchLogsExports: [
          'trace',
          'listener',
          'audit',
          'alert',
          'oemagent',
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSMultiAZSupport: Non-Aurora RDS DB instances have multi-AZ support enabled', () => {
    const ruleId = 'RDSMultiAZSupport';
    test('Noncompliance 1', () => {
      const vpc = new Vpc(stack, 'rVpc');
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
        multiAz: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const vpc2 = new Vpc(stack, 'rVpc');
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc2,
        multiAz: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSRestrictedInbound: RDS DB security groups do not allow for 0.0.0.0/0 inbound access', () => {
    const ruleId = 'RDSRestrictedInbound';
    test('Noncompliance 1', () => {
      new CfnDBSecurityGroup(stack, 'rSg', {
        groupDescription: 'The best description.',
        dbSecurityGroupIngress: [{ cidrip: '1.1.1.1/0' }],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDBSecurityGroupIngress(stack, 'rIngress', {
        dbSecurityGroupName: 'foo',
        cidrip: '0.0.0.0/0',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDBSecurityGroup(stack, 'rSg', {
        groupDescription: 'The best description.',
        dbSecurityGroupIngress: [],
      });
      new CfnDBSecurityGroup(stack, 'rSg2', {
        groupDescription: 'The best description.',
        dbSecurityGroupIngress: [],
      });
      new CfnDBSecurityGroupIngress(stack, 'rIngress', {
        dbSecurityGroupName: 'foo',
        cidrip: '1.2.3.4/32',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSNonDefaultPort: RDS DB instances and Aurora DB clusters do not use the default endpoint ports', () => {
    const ruleId = 'RDSNonDefaultPort';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(stack, 'rVpc') },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        port: 5432,
        vpc: new Vpc(stack, 'rVpc'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const vpc = new Vpc(stack, 'rVpc');
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: vpc },
        port: 42,
      });
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
        port: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RDSStorageEncrypted: RDS DB instances and Aurora DB clusters have storage encryption enabled', () => {
    const ruleId = 'RDSStorageEncrypted';
    test('Noncompliance 1', () => {
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(stack, 'rVpc') },
        storageEncrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: new Vpc(stack, 'rVpc'),
        storageEncrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const vpc = new Vpc(stack, 'rVpc');
      new DatabaseCluster(stack, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: vpc },
        storageEncrypted: true,
      });
      new DatabaseInstance(stack, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
        storageEncrypted: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

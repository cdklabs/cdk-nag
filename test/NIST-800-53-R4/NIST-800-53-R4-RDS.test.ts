/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { BackupPlan, BackupResource } from '@aws-cdk/aws-backup';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  AuroraMysqlEngineVersion,
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
} from '@aws-cdk/aws-rds';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon Relational Database Service (RDS)', () => {
  test('NIST.800.53.R4-RDSLoggingEnabled: RDS DB instances have all CloudWatch logging exports enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new DatabaseInstance(nonCompliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.mariaDb({
        version: MariaDbEngineVersion.VER_10_2,
      }),
      port: 5432,
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
    new DatabaseInstance(nonCompliant2, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_10,
      }),
      port: 5432,
      vpc: new Vpc(nonCompliant2, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R4Checks());
    new DatabaseInstance(nonCompliant3, 'rDbInstance', {
      engine: DatabaseInstanceEngine.sqlServerWeb({
        version: SqlServerEngineVersion.VER_11,
      }),
      port: 5432,
      vpc: new Vpc(nonCompliant3, 'rVpc'),
      cloudwatchLogsExports: ['error'],
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R4Checks());
    new DatabaseInstance(nonCompliant4, 'rDbInstance', {
      engine: DatabaseInstanceEngine.mysql({
        version: MysqlEngineVersion.VER_8_0_25,
      }),
      port: 5432,
      vpc: new Vpc(nonCompliant4, 'rVpc'),
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new NIST80053R4Checks());
    new DatabaseInstance(nonCompliant5, 'rDbInstance', {
      engine: DatabaseInstanceEngine.oracleEe({
        version: OracleEngineVersion.VER_19_0_0_0_2021_04_R1,
      }),
      port: 5432,
      vpc: new Vpc(nonCompliant5, 'rVpc'),
      cloudwatchLogsExports: ['trace', 'listener'],
    });
    const messages5 = SynthUtils.synthesize(nonCompliant5).messages;
    expect(messages5).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    new DatabaseInstance(compliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.mariaDb({
        version: MariaDbEngineVersion.VER_10_2,
      }),
      port: 5432,
      vpc: new Vpc(compliant, 'rVpc'),
      cloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery'],
    });
    const messages6 = SynthUtils.synthesize(compliant).messages;
    expect(messages6).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant2 = new Stack();
    Aspects.of(compliant2).add(new NIST80053R4Checks());
    new DatabaseInstance(compliant2, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_11,
      }),
      port: 5432,
      vpc: new Vpc(compliant2, 'rVpc'),
      cloudwatchLogsExports: ['postgresql', 'upgrade'],
    });
    const messages7 = SynthUtils.synthesize(compliant2).messages;
    expect(messages7).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant3 = new Stack();
    Aspects.of(compliant3).add(new NIST80053R4Checks());
    new DatabaseInstance(compliant3, 'rDbInstance', {
      engine: DatabaseInstanceEngine.sqlServerEe({
        version: SqlServerEngineVersion.VER_11,
      }),
      port: 5432,
      vpc: new Vpc(compliant3, 'rVpc'),
      cloudwatchLogsExports: ['agent', 'error'],
    });
    const messages8 = SynthUtils.synthesize(compliant3).messages;
    expect(messages8).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant4 = new Stack();
    Aspects.of(compliant4).add(new NIST80053R4Checks());
    new DatabaseInstance(compliant4, 'rDbInstance', {
      engine: DatabaseInstanceEngine.mysql({
        version: MysqlEngineVersion.VER_8_0_25,
      }),
      port: 5432,
      vpc: new Vpc(compliant4, 'rVpc'),
      cloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery'],
    });
    const messages9 = SynthUtils.synthesize(compliant4).messages;
    expect(messages9).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant5 = new Stack();
    Aspects.of(compliant5).add(new NIST80053R4Checks());
    new DatabaseInstance(compliant5, 'rDbInstance', {
      engine: DatabaseInstanceEngine.oracleSe2({
        version: OracleEngineVersion.VER_19_0_0_0_2021_04_R1,
      }),
      port: 5432,
      vpc: new Vpc(compliant5, 'rVpc'),
      cloudwatchLogsExports: [
        'trace',
        'listener',
        'audit',
        'alert',
        'oemagent',
      ],
    });
    const messages10 = SynthUtils.synthesize(compliant5).messages;
    expect(messages10).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSLoggingEnabled:'),
        }),
      })
    );
  });
  test('NIST.800.53.R4-RDSInstanceDeletionProtectionEnabled: RDS DB instances and Aurora DB clusters have deletion protection enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new DatabaseCluster(positive, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: new Vpc(positive, 'rVpc') },
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );
    const positive2 = new Stack();
    Aspects.of(positive2).add(new NIST80053R4Checks());
    new DatabaseInstance(positive2, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: new Vpc(positive2, 'rVpc'),
      deletionProtection: false,
    });
    const messages2 = SynthUtils.synthesize(positive2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    const vpc = new Vpc(negative, 'rVpc');
    new DatabaseCluster(negative, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: vpc },
      deletionProtection: true,
    });
    new DatabaseInstance(negative, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      deletionProtection: true,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53.R4-RDSStorageEncrypted: RDS DB instances and Aurora DB clusters have storage encrypted', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new DatabaseCluster(positive, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: new Vpc(positive, 'rVpc') },
      storageEncrypted: false,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSStorageEncrypted:'),
        }),
      })
    );
    const positive2 = new Stack();
    Aspects.of(positive2).add(new NIST80053R4Checks());
    new DatabaseInstance(positive2, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: new Vpc(positive2, 'rVpc'),
      storageEncrypted: false,
    });
    const messages2 = SynthUtils.synthesize(positive2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSStorageEncrypted:'),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    const vpc = new Vpc(negative, 'rVpc');
    new DatabaseCluster(negative, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: vpc },
      storageEncrypted: true,
    });
    new DatabaseInstance(negative, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      storageEncrypted: true,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSStorageEncrypted:'),
        }),
      })
    );
  });
  test('NIST.800.53.R4-RDSEnhancedMonitoring: RDS DB instances have enhanced monitoring enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new CfnDBInstance(positive, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      monitoringInterval: 0,
    });
    const messages2 = SynthUtils.synthesize(positive).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSEnhancedMonitoringEnabled:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    new CfnDBInstance(negative, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      monitoringInterval: 15,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSEnhancedMonitoringEnabled:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53.R4-RDSInBackupPlan: - RDS DB Instances are part of AWS Backup plan(s) - (Control IDs: CP-9(b), CP-10, SI-12)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSInBackupPlan:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      compliant,
      'rPlan'
    ).addSelection('Selection', {
      resources: [
        BackupResource.fromRdsDatabaseInstance(
          new DatabaseInstance(compliant, 'rDbInstance2', {
            engine: DatabaseInstanceEngine.postgres({
              version: PostgresEngineVersion.VER_13_2,
            }),
            vpc: new Vpc(compliant, 'rVpc2'),
          })
        ),
      ],
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSInBackupPlan:'),
        }),
      })
    );
  });
  test('NIST.800.53.R4-RDSMultiAZSupport: Non-Aurora RDS DB instances have multi-AZ support enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    const vpc = new Vpc(positive, 'rVpc');
    new DatabaseInstance(positive, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      multiAz: false,
    });
    const messages2 = SynthUtils.synthesize(positive).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSMultiAZSupport:'),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    const vpc2 = new Vpc(negative, 'rVpc');
    new DatabaseInstance(negative, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc2,
      multiAz: true,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-RDSMultiAZSupport:'),
        }),
      })
    );
  });
  test('NIST.800.53.R4-RDSInstanceBackupEnabled: RDS DB instances have backups enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      backupRetentionPeriod: 0,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSInstanceBackupEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    new CfnDBInstance(compliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
    });
    new CfnDBInstance(compliant, 'rDbInstance2', {
      dbInstanceClass: 'db.t3.micro',
      backupRetentionPeriod: 15,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSInstanceBackupEnabled:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53.R4-RDSInstancePublicAccess: RDS DB instances do not allow public access', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    const vpc = new Vpc(positive, 'rVpc');
    new DatabaseInstance(positive, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      publiclyAccessible: true,
    });
    const messages2 = SynthUtils.synthesize(positive).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSInstancePublicAccess:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    const vpc2 = new Vpc(negative, 'rVpc');
    new DatabaseInstance(negative, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc2,
      publiclyAccessible: false,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RDSInstancePublicAccess:'
          ),
        }),
      })
    );
  });
});

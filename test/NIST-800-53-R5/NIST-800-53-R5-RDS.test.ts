/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  AuroraMysqlEngineVersion,
  CfnDBInstance,
  DatabaseCluster as AuroraCluster,
  DatabaseClusterEngine,
  DatabaseInstance as RdsInstance,
  DatabaseInstance,
  DatabaseInstanceEngine,
  MariaDbEngineVersion,
  PostgresEngineVersion,
  SqlServerEngineVersion,
  MysqlEngineVersion,
  OracleEngineVersion,
} from '@aws-cdk/aws-rds';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Relational Database Service (RDS)', () => {
  test('NIST.800.53.R5-RDSEnhancedMonitoring: - RDS DB instances have enhanced monitoring enabled - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-36(1)(a), SI-2a)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      monitoringInterval: 0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSEnhancedMonitoringEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnDBInstance(compliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      monitoringInterval: 15,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSEnhancedMonitoringEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RDSInstanceBackupEnabled: - RDS DB instances have backup enabled - (Control IDs: CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstanceBackupEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnDBInstance(nonCompliant2, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      backupRetentionPeriod: 0,
    });
    const messages4 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstanceBackupEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnDBInstance(compliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      backupRetentionPeriod: 15,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstanceBackupEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RDSInstanceDeletionProtectionEnabled: - RDS DB instances and Aurora DB clusters have Deletion Protection enabled - (Control IDs: CA-7(4)(c), CM-3a, CP-1a.1(b), CP-1a.2, CP-2a, CP-2a.6, CP-2a.7, CP-2d, CP-2e, CP-2(5), SA-15a.4, SC-5(2), SC-22, SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new AuroraCluster(nonCompliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: new Vpc(nonCompliant, 'rVpc') },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new RdsInstance(nonCompliant2, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: new Vpc(nonCompliant2, 'rVpc'),
      deletionProtection: false,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const vpc = new Vpc(compliant, 'rVpc');
    new AuroraCluster(compliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: vpc },
      deletionProtection: true,
    });
    new RdsInstance(compliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      deletionProtection: true,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RDSInstancePublicAccess: - RDS DB instances are not publicly accessible - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    const vpc = new Vpc(nonCompliant, 'rVpc');
    new RdsInstance(nonCompliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      publiclyAccessible: true,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstancePublicAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const vpc2 = new Vpc(compliant, 'rVpc');
    new RdsInstance(compliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc2,
      publiclyAccessible: false,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RDSInstancePublicAccess:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RDSLoggingEnabled: RDS DB instances are configured to export all possible log types to CloudWatch - (Control IDs: AC-2(4), AC-3(1), AC-3(10), AC-4(26), AC-6(9), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-1(1)(c), SI-3(8)(b), SI-4(2), SI-4(17), SI-4(20), SI-7(8), SI-10(1)(c))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant2 = new Stack();
    Aspects.of(compliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant3 = new Stack();
    Aspects.of(compliant3).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant4 = new Stack();
    Aspects.of(compliant4).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant5 = new Stack();
    Aspects.of(compliant5).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-RDSLoggingEnabled:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RDSMultiAZSupport: - Non-Aurora RDS DB instances have multi-AZ support enabled - (Control IDs: CP-1a.1(b), CP-1a.2, CP-2a, CP-2a.6, CP-2a.7, CP-2d, CP-2e, CP-2(5), CP-2(6), CP-6(2), CP-10, SC-5(2), SC-6, SC-22, SC-36, SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    const vpc = new Vpc(nonCompliant, 'rVpc');
    new RdsInstance(nonCompliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      multiAz: false,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-RDSMultiAZSupport:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const vpc2 = new Vpc(compliant, 'rVpc');
    new RdsInstance(compliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc2,
      multiAz: true,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-RDSMultiAZSupport:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RDSStorageEncrypted: RDS DB instances and Aurora DB clusters have storage encryption enabled - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new AuroraCluster(nonCompliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: new Vpc(nonCompliant, 'rVpc') },
      storageEncrypted: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-RDSStorageEncrypted:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new RdsInstance(nonCompliant2, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: new Vpc(nonCompliant2, 'rVpc'),
      storageEncrypted: false,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-RDSStorageEncrypted:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const vpc = new Vpc(compliant, 'rVpc');
    new AuroraCluster(compliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: vpc },
      storageEncrypted: true,
    });
    new RdsInstance(compliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      storageEncrypted: true,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-RDSStorageEncrypted:'),
        }),
      })
    );
  });
});

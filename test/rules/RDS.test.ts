/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { BackupPlan, BackupResource } from 'aws-cdk-lib/aws-backup';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
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
  CfnDBCluster,
  CfnDBSecurityGroup,
  CfnDBSecurityGroupIngress,
} from 'aws-cdk-lib/aws-rds';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
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

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
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
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('Amazon Relational Database Service (RDS) and Amazon Aurora', () => {
  test('AuroraMySQLBacktrack: RDS Aurora MySQL clusters have Backtrack enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: new Vpc(nonCompliant, 'rVpc') },
    });

    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AuroraMySQLBacktrack:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBCluster(compliant, 'rDbCluster', {
      engine: 'aurora',
      backtrackWindow: 42,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AuroraMySQLBacktrack:'),
        }),
      })
    );
  });

  test('AuroraMySQLLogging: RDS Aurora serverless clusters have all available Log Exports enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBCluster(nonCompliant, 'rDbCluster', {
      engine: 'aurora-mysql',
      engineMode: 'serverless',
      scalingConfiguration: {
        maxCapacity: 42,
        minCapacity: 7,
      },
      enableCloudwatchLogsExports: ['audit', 'error'],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AuroraMySQLLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBCluster(compliant, 'rDbCluster', {
      engine: 'aurora-postgresql',
      engineMode: 'serverless',
      scalingConfiguration: {
        maxCapacity: 42,
        minCapacity: 7,
      },
    });
    new CfnDBCluster(compliant, 'rDbCluster2', {
      engine: 'aurora-mysql',
      engineMode: 'serverless',
      scalingConfiguration: {
        maxCapacity: 42,
        minCapacity: 7,
      },
      enableCloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery'],
    });
    new CfnDBCluster(compliant, 'rDbCluster3', {
      engine: 'aurora-mysql',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AuroraMySQLLogging:'),
        }),
      })
    );
  });

  test('AuroraMySQLPostgresIAMAuth: RDS Aurora MySQL/PostgresSQL clusters have IAM Database Authentication enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: new Vpc(nonCompliant, 'rVpc') },
      iamAuthentication: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AuroraMySQLPostgresIAMAuth:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const vpc = new Vpc(compliant, 'rVpc');
    new DatabaseCluster(compliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      iamAuthentication: true,
      instanceProps: { vpc: vpc },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AuroraMySQLPostgresIAMAuth:'),
        }),
      })
    );
  });

  test('RDSAutomaticMinorVersionUpgradeEnabled: RDS DB instances have automatic minor version upgrades enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      autoMinorVersionUpgrade: false,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'RDSAutomaticMinorVersionUpgradeEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBInstance(compliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'RDSAutomaticMinorVersionUpgradeEnabled:'
          ),
        }),
      })
    );
  });

  test('RDSEnhancedMonitoring: RDS DB instances have enhanced monitoring enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      monitoringInterval: 0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSEnhancedMonitoringEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBInstance(compliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      monitoringInterval: 15,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSEnhancedMonitoringEnabled:'),
        }),
      })
    );
  });

  test('RDSInBackupPlan: RDS DB Instances are part of AWS Backup plan(s)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSInBackupPlan:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('RDSInBackupPlan:'),
        }),
      })
    );
  });

  test('RDSInstanceBackupEnabled: RDS DB instances have backup enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      backupRetentionPeriod: 0,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSInstanceBackupEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('RDSInstanceBackupEnabled:'),
        }),
      })
    );
  });

  test('RDSInstanceDeletionProtectionEnabled: RDS DB instances and Aurora DB clusters have Deletion Protection enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDbCluster', {
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
            'RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new DatabaseInstance(nonCompliant2, 'rDbInstance', {
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
            'RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const vpc = new Vpc(compliant, 'rVpc');
    new DatabaseCluster(compliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: vpc },
      deletionProtection: true,
    });
    new DatabaseInstance(compliant, 'rDbInstance', {
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
            'RDSInstanceDeletionProtectionEnabled:'
          ),
        }),
      })
    );
  });

  test('RDSInstancePublicAccess: RDS DB instances are not publicly accessible', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    const vpc = new Vpc(nonCompliant, 'rVpc');
    new DatabaseInstance(nonCompliant, 'rDbInstance', {
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
          data: expect.stringContaining('RDSInstancePublicAccess:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const vpc2 = new Vpc(compliant, 'rVpc');
    new DatabaseInstance(compliant, 'rDbInstance', {
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
          data: expect.stringContaining('RDSInstancePublicAccess:'),
        }),
      })
    );
  });

  test('RDSLoggingEnabled: RDS DB instances are configured to export all possible log types to CloudWatch', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant2 = new Stack();
    Aspects.of(compliant2).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant3 = new Stack();
    Aspects.of(compliant3).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant4 = new Stack();
    Aspects.of(compliant4).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant5 = new Stack();
    Aspects.of(compliant5).add(new TestPack());
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
          data: expect.stringContaining('RDSLoggingEnabled:'),
        }),
      })
    );
  });

  test('RDSMultiAZSupport: Non-Aurora RDS DB instances have multi-AZ support enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    const vpc = new Vpc(nonCompliant, 'rVpc');
    new DatabaseInstance(nonCompliant, 'rDbInstance', {
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
          data: expect.stringContaining('RDSMultiAZSupport:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const vpc2 = new Vpc(compliant, 'rVpc');
    new DatabaseInstance(compliant, 'rDbInstance', {
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
          data: expect.stringContaining('RDSMultiAZSupport:'),
        }),
      })
    );
  });

  test('RDSRestrictedInbound: RDS DB security groups do not allow for 0.0.0.0/0 inbound access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBSecurityGroup(nonCompliant, 'rSg', {
      groupDescription: 'The best description.',
      dbSecurityGroupIngress: [{ cidrip: '1.1.1.1/0' }],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSRestrictedInbound:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnDBSecurityGroupIngress(nonCompliant2, 'rIngress', {
      dbSecurityGroupName: 'foo',
      cidrip: '0.0.0.0/0',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSRestrictedInbound:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBSecurityGroup(compliant, 'rSg', {
      groupDescription: 'The best description.',
      dbSecurityGroupIngress: [],
    });
    new CfnDBSecurityGroup(compliant, 'rSg2', {
      groupDescription: 'The best description.',
      dbSecurityGroupIngress: [],
    });
    new CfnDBSecurityGroupIngress(compliant, 'rIngress', {
      dbSecurityGroupName: 'foo',
      cidrip: '1.2.3.4/32',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSRestrictedInbound:'),
        }),
      })
    );
  });

  test('RDSNonDefaultPort: RDS DB instances and Aurora DB clusters do not use the default endpoint ports', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: new Vpc(nonCompliant, 'rVpc') },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSNonDefaultPort:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new DatabaseInstance(nonCompliant2, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      port: 5432,
      vpc: new Vpc(nonCompliant2, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSNonDefaultPort:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const vpc = new Vpc(compliant, 'rVpc');
    new DatabaseCluster(compliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: vpc },
      port: 42,
    });
    new DatabaseInstance(compliant, 'rDbInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_2,
      }),
      vpc: vpc,
      port: 42,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RDSNonDefaultPort:'),
        }),
      })
    );
  });

  test('RDSStorageEncrypted: RDS DB instances and Aurora DB clusters have storage encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDbCluster', {
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
          data: expect.stringContaining('RDSStorageEncrypted:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new DatabaseInstance(nonCompliant2, 'rDbInstance', {
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
          data: expect.stringContaining('RDSStorageEncrypted:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const vpc = new Vpc(compliant, 'rVpc');
    new DatabaseCluster(compliant, 'rDbCluster', {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: { vpc: vpc },
      storageEncrypted: true,
    });
    new DatabaseInstance(compliant, 'rDbInstance', {
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
          data: expect.stringContaining('RDSStorageEncrypted:'),
        }),
      })
    );
  });
});

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
import { PCIDSS321Checks } from '../../src';

describe('Amazon Relational Database Service (RDS)', () => {
  test('PCI.DSS.321-RDSAutomaticMinorVersionUpgradeEnabled: - RDS DB instances have automatic minor version upgrades enabled - (Control ID: 6.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnDBInstance(nonCompliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
      autoMinorVersionUpgrade: false,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-RDSAutomaticMinorVersionUpgradeEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new CfnDBInstance(compliant, 'rDbInstance', {
      dbInstanceClass: 'db.t3.micro',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-RDSAutomaticMinorVersionUpgradeEnabled:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-RDSInstancePublicAccess: - RDS DB instances are not publicly accessible - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSInstancePublicAccess:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSInstancePublicAccess:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-RDSLoggingEnabled: RDS DB instances are configured to export all possible log types to CloudWatch - (Control IDs: 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant2 = new Stack();
    Aspects.of(compliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant3 = new Stack();
    Aspects.of(compliant3).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant4 = new Stack();
    Aspects.of(compliant4).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );

    const compliant5 = new Stack();
    Aspects.of(compliant5).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSLoggingEnabled:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-RDSStorageEncrypted: RDS DB instances and Aurora DB clusters have storage encryption enabled - (Control IDs: 3.4, 8.2.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSStorageEncrypted:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSStorageEncrypted:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-RDSStorageEncrypted:'),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnCluster, CfnClusterParameterGroup } from '@aws-cdk/aws-redshift';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  RedshiftBackupEnabled,
  RedshiftClusterAuditLogging,
  RedshiftClusterConfiguration,
  RedshiftClusterEncryptionAtRest,
  RedshiftClusterInVPC,
  RedshiftClusterMaintenanceSettings,
  RedshiftClusterNonDefaultPort,
  RedshiftClusterNonDefaultUsername,
  RedshiftClusterPublicAccess,
  RedshiftClusterUserActivityLogging,
  RedshiftClusterVersionUpgrade,
  RedshiftEnhancedVPCRoutingEnabled,
  RedshiftRequireTlsSSL,
} from '../../src/rules/redshift';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        RedshiftBackupEnabled,
        RedshiftClusterAuditLogging,
        RedshiftClusterConfiguration,
        RedshiftClusterEncryptionAtRest,
        RedshiftClusterInVPC,
        RedshiftClusterMaintenanceSettings,
        RedshiftClusterNonDefaultPort,
        RedshiftClusterNonDefaultUsername,
        RedshiftClusterPublicAccess,
        RedshiftClusterUserActivityLogging,
        RedshiftClusterVersionUpgrade,
        RedshiftEnhancedVPCRoutingEnabled,
        RedshiftRequireTlsSSL,
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

describe('Amazon Redshift', () => {
  test('RedshiftBackupEnabled: Redshift clusters have automated snapshots enabled and the retention period is between 1 and 35 days', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      automatedSnapshotRetentionPeriod: 0,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftBackupEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      automatedSnapshotRetentionPeriod: 1,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftBackupEnabled:'),
        }),
      })
    );
  });

  test('RedshiftClusterAuditLogging: Redshift clusters have audit logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterAuditLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      loggingProperties: { bucketName: 'foo' },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterAuditLogging:'),
        }),
      })
    );
  });

  test('RedshiftClusterConfiguration: Redshift clusters have encryption and audit logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterConfiguration:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCluster(nonCompliant2, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      encrypted: false,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterConfiguration:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      loggingProperties: { bucketName: 'foo' },
      encrypted: true,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterConfiguration:'),
        }),
      })
    );
  });

  test('RedshiftClusterEncryptionAtRest: Redshift clusters have encryption at rest enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterEncryptionAtRest:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      encrypted: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterEncryptionAtRest:'),
        }),
      })
    );
  });

  test('RedshiftClusterInVPC: Redshift clusters are provisioned in a VPC', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterInVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterSubnetGroupName: 'foo',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterInVPC:'),
        }),
      })
    );
  });

  test('RedshiftClusterMaintenanceSettings: Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterMaintenanceSettings:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCluster(nonCompliant2, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      allowVersionUpgrade: false,
      preferredMaintenanceWindow: 'Sun:23:45-Mon:00:15',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterMaintenanceSettings:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      allowVersionUpgrade: true,
      preferredMaintenanceWindow: 'Sun:23:45-Mon:00:15',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterMaintenanceSettings:'),
        }),
      })
    );
  });

  test('RedshiftClusterNonDefaultPort: Redshift clusters do not use the default endpoint port', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterNonDefaultPort:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      port: 42,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterNonDefaultPort:'),
        }),
      })
    );
  });

  test('RedshiftClusterNonDefaultUsername: Redshift clusters use custom user names vice the default (awsuser)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'awsuser',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterNonDefaultUsername:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'notawsuser',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterNonDefaultUsername:'),
        }),
      })
    );
  });

  test('RedshiftClusterPublicAccess: Redshift clusters do not allow public access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'awsuser',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      publiclyAccessible: true,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterPublicAccess:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'awsuser',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterPublicAccess:'),
        }),
      })
    );
  });

  test('RedshiftClusterUserActivityLogging: Redshift clusters have user user activity logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterUserActivityLogging:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    const nonCompliant2ParamGroup = new CfnClusterParameterGroup(
      nonCompliant2,
      'rBadParameterGroup',
      {
        description: 'foo',
        parameterGroupFamily: 'redshift-1.0',
      }
    );
    new CfnClusterParameterGroup(nonCompliant2, 'rGoodParameterGroup', {
      description: 'foo',
      parameterGroupFamily: 'redshift-1.0',
      parameters: [
        {
          parameterName: 'enable_user_activity_logging',
          parameterValue: 'true',
        },
      ],
    });
    new CfnCluster(nonCompliant2, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterParameterGroupName: nonCompliant2ParamGroup.ref,
    });

    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterUserActivityLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const compliantParamGroup = new CfnClusterParameterGroup(
      compliant,
      'rCfnParameterGroup',
      {
        description: 'foo',
        parameterGroupFamily: 'redshift-1.0',
        parameters: [
          {
            parameterName: 'enable_user_activity_logging',
            parameterValue: 'true',
          },
        ],
      }
    );
    new CfnCluster(compliant, 'rCfnRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterParameterGroupName: compliantParamGroup.ref,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterUserActivityLogging:'),
        }),
      })
    );
  });

  test('RedshiftClusterVersionUpgrade: Redshift clusters have version upgrade enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      allowVersionUpgrade: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterVersionUpgrade:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftClusterVersionUpgrade:'),
        }),
      })
    );
  });

  test('RedshiftEnhancedVPCRoutingEnabled: Redshift clusters have enhanced VPC routing enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftEnhancedVPCRoutingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterSubnetGroupName: 'foo',
      enhancedVpcRouting: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftEnhancedVPCRoutingEnabled:'),
        }),
      })
    );
  });

  test('RedshiftRequireTlsSSL: Redshift clusters require TLS/SSL encryption', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftRequireTlsSSL:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCluster(nonCompliant2, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterParameterGroupName: new CfnClusterParameterGroup(
        nonCompliant2,
        'rRedshiftParamGroup',
        {
          description: 'Cluster parameter group for family redshift-1.0',
          parameterGroupFamily: 'redshift-1.0',
          parameters: [
            {
              parameterName: 'require_ssl',
              parameterValue: 'false',
            },
          ],
        }
      ).ref,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftRequireTlsSSL:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnCluster(nonCompliant3, 'rRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterParameterGroupName: new CfnClusterParameterGroup(
        nonCompliant3,
        'rRedshiftParamGroup',
        {
          description: 'Cluster parameter group for family redshift-1.0',
          parameterGroupFamily: 'redshift-1.0',
          parameters: [
            {
              parameterName: 'auto_analyze',
              parameterValue: 'true',
            },
          ],
        }
      ).ref,
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftRequireTlsSSL:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const compliantParameterGroup = new CfnClusterParameterGroup(
      compliant,
      'rRedshiftParamGroup',
      {
        description: 'Cluster parameter group for family redshift-1.0',
        parameterGroupFamily: 'redshift-1.0',
        parameters: [
          {
            parameterName: 'require_ssl',
            parameterValue: 'true',
          },
        ],
      }
    );
    new CfnCluster(compliant, 'rCfnRedshiftCluster', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterSubnetGroupName: 'foo',
      enhancedVpcRouting: true,
      clusterParameterGroupName: compliantParameterGroup.ref,
    });
    new CfnCluster(compliant, 'rCfnRedshiftCluster2', {
      masterUsername: 'use_a_secret_here',
      masterUserPassword: 'use_a_secret_here',
      clusterType: 'single-node',
      dbName: 'bar',
      nodeType: 'ds2.xlarge',
      clusterSubnetGroupName: 'foo',
      enhancedVpcRouting: true,
      clusterParameterGroupName: compliantParameterGroup.ref,
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('RedshiftRequireTlsSSL:'),
        }),
      })
    );
  });
});

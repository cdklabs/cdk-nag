/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { CfnCluster, Cluster } from '@aws-cdk/aws-redshift';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Redshift', () => {
  test('NIST.800.53.R5-RedshiftBackupEnabled: - Redshift clusters have automated snapshots enabled and the retention period is between 1 and 35 days - (Control IDs: CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftBackupEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftBackupEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RedshiftClusterConfiguration: - Redshift clusters have encryption and audit logging enabled - (Control IDs: AC-2(4), AC-3(1), AC-3(10), AC-4(26), AC-6(9), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-9(3), AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), CP-9d, IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-1(1)(c), SI-3(8)(b), SI-4(2), SI-4(17), SI-4(20), SI-7(8), SI-10(1)(c), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new Cluster(nonCompliant2, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant2, 'rVpc'),
      encrypted: false,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
      loggingBucket: new Bucket(compliant, 'rLoggingBucket'),
      encrypted: true,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RedshiftClusterMaintenanceSettings: - Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured - (Control IDs: CM-2b, CM-2b.1, CM-2b.2, CM-2b.3, CM-3(3), CP-9a, CP-9b, CP-9c, SC-5(2), SI-2c, SI-2d, SI-2(2), SI-2(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
      preferredMaintenanceWindow: 'Sun:23:45-Mon:00:15',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RedshiftClusterPublicAccess: - Redshift clusters do not allow public access - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
      publiclyAccessible: true,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-RedshiftEnhancedVPCRoutingEnabled: - Redshift clusters have enhanced VPC routing enabled - (Control IDs: AC-4(21), SC-7b)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftEnhancedVPCRoutingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-RedshiftEnhancedVPCRoutingEnabled:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { CfnCluster, Cluster } from '@aws-cdk/aws-redshift';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('Amazon Redshift', () => {
  test('HIPAA.Security-RedshiftBackupEnabled: - Redshift clusters have automated snapshots enabled and the retention period is between 1 and 35 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-RedshiftBackupEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-RedshiftBackupEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-RedshiftClusterConfiguration: - Redshift clusters have encryption and audit logging enabled - (Control IDs: 64.312(a)(2)(iv), 164.312(b), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-RedshiftClusterMaintenanceSettings: - Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured - (Control IDs: 164.308(a)(5)(ii)(A), 164.308(a)(7)(ii)(A))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-RedshiftClusterPublicAccess: - Redshift clusters do not allow public access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-RedshiftEnhancedVPCRoutingEnabled: - Redshift clusters have enhanced VPC routing enabled - (Control IDs: 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-RedshiftEnhancedVPCRoutingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-RedshiftEnhancedVPCRoutingEnabled:'
          ),
        }),
      })
    );
  });
});

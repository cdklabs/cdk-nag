/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  CfnCluster,
  Cluster,
  ClusterParameterGroup,
} from '@aws-cdk/aws-redshift';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon Redshift', () => {
  test('PCI.DSS.321-RedshiftClusterConfiguration: - Redshift clusters have encryption and audit logging enabled - (Control IDs: 3.4, 8.2.1, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-RedshiftClusterMaintenanceSettings: - Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured - (Control ID: 6.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-RedshiftClusterMaintenanceSettings:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-RedshiftClusterPublicAccess: - Redshift clusters do not allow public access - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-RedshiftEnhancedVPCRoutingEnabled: - Redshift clusters have enhanced VPC routing enabled - (Control IDs: 1.2, 1.3, 1.3.1, 1.3.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-RedshiftEnhancedVPCRoutingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-RedshiftEnhancedVPCRoutingEnabled:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-RedshiftRequireTlsSSL: - Redshift clusters require TLS/SSL encryption - (Control IDs: 2.3, 4.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-RedshiftRequireTlsSSL:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new Cluster(nonCompliant2, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant2, 'rVpc'),
      parameterGroup: new ClusterParameterGroup(
        nonCompliant2,
        'rRedshiftParamGroup',
        {
          parameters: { require_ssl: 'false' },
        }
      ),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-RedshiftRequireTlsSSL:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
    new Cluster(nonCompliant3, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant3, 'rVpc'),
      parameterGroup: new ClusterParameterGroup(
        nonCompliant3,
        'rRedshiftParamGroup',
        {
          parameters: { auto_analyze: 'true' },
        }
      ),
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-RedshiftRequireTlsSSL:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    const compliantParameterGroup = new ClusterParameterGroup(
      compliant,
      'rRedshiftParamGroup',
      {
        parameters: { require_ssl: 'true' },
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
      clusterParameterGroupName:
        compliantParameterGroup.clusterParameterGroupName,
    });
    new Cluster(compliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(compliant, 'rVpc'),
      parameterGroup: compliantParameterGroup,
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-RedshiftRequireTlsSSL:'),
        }),
      })
    );
  });
});

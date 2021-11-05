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
import { NIST80053R4Checks } from '../../src';

describe('Amazon Redshift', () => {
  test('NIST.800.53.R4-RedshiftClusterConfiguration: Redshift clusters have encryption and audit logging enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new Cluster(positive, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(positive, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const positive2 = new Stack();
    Aspects.of(positive2).add(new NIST80053R4Checks());
    new Cluster(positive2, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(positive2, 'rVpc'),
      encrypted: false,
    });
    const messages3 = SynthUtils.synthesize(positive2).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    new Cluster(negative, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(negative, 'rVpc'),
      loggingBucket: new Bucket(negative, 'rLoggingBucket'),
      encrypted: true,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftClusterConfiguration:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R4-RedshiftClusterPublicAccess: Redshift clusters are not publicly accessible', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new Cluster(positive, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(positive, 'rVpc'),
      publiclyAccessible: true,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    new Cluster(negative, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(negative, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftClusterPublicAccess:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R4-RedshiftRequireTlsSSL: - Redshift clusters require TLS/SSL encryption - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new Cluster(nonCompliant, 'rRedshiftCluster', {
      masterUser: { masterUsername: 'use_a_secret_here' },
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftRequireTlsSSL:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftRequireTlsSSL:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R4Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftRequireTlsSSL:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R4-RedshiftRequireTlsSSL:'
          ),
        }),
      })
    );
  });
});

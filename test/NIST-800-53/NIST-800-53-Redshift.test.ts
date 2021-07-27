/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnCluster as CfnDaxCluster } from '@aws-cdk/aws-dax';
import {
  CfnDBCluster as CfnDocumentCluster,
  DatabaseCluster as DocumentCluster,
} from '@aws-cdk/aws-docdb';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc,
} from '@aws-cdk/aws-ec2';
import {
  Cluster,
} from '@aws-cdk/aws-redshift';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('Amazon Redshift', () => {
    test('NIST.800.53-RedshiftClusterConfiguration: Redshift clusters have encryption and audit logging enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new Cluster(positive, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(positive, 'rVpc'),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RedshiftClusterConfiguration:'),
          }),
        }),
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new Cluster(positive2, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(positive2, 'rVpc'),
        encrypted: false
      });
      const messages3 = SynthUtils.synthesize(positive2).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RedshiftClusterConfiguration:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
        loggingBucket: new Bucket(negative, 'rLoggingBucket'),
        encrypted: true
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RedshiftClusterConfiguration:'),
          }),
        }),
      );
    });

    test('NIST.800.53-RedshiftClusterPublicAccess: Redshift clusters are not publicly accessible', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new Cluster(positive, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(positive, 'rVpc'),
        publiclyAccessible: true,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RedshiftClusterPublicAccess:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RedshiftClusterPublicAccess:'),
          }),
        }),
      );
    });
});
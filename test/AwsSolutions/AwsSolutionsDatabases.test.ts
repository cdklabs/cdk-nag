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
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import {
  CfnDBCluster as CfnNeptuneCluster,
  CfnDBInstance as CfnNeptuneInstance,
  DatabaseCluster as NeptuneCluster,
  DatabaseInstance as NeptuneInstance,
  InstanceType as NeptuneInstanceType,
} from '@aws-cdk/aws-neptune';
import {
  AuroraMysqlEngineVersion,
  CfnDBCluster as CfnAuroraCluster,
  DatabaseCluster as AuroraCluster,
  DatabaseClusterEngine,
  DatabaseInstance as RdsInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from '@aws-cdk/aws-rds';
import {
  Cluster,
  ClusterParameterGroup,
  CfnCluster as CfnRedshiftCluster,
} from '@aws-cdk/aws-redshift';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Duration, SecretValue, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Solutions Databases Checks', () => {
  describe('Amazon Relational Database Service (Amazon RDS) and Amazon Aurora', () => {
    test('awsSolutionsRds2: RDS DB instances and Aurora DB clusters have storage encryption enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new AuroraCluster(positive, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(positive, 'rVpc') },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS2:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new RdsInstance(positive2, 'rDbInstance', {
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
            data: expect.stringContaining('AwsSolutions-RDS2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const vpc = new Vpc(negative, 'rVpc');
      new AuroraCluster(negative, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: vpc },
        storageEncrypted: true,
      });
      new RdsInstance(negative, 'rDbInstance', {
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
            data: expect.stringContaining('AwsSolutions-RDS2:'),
          }),
        })
      );
    });
    test('awsSolutionsRds6: RDS Aurora MySQL/PostgresSQL clusters have IAM Database Authentication enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new AuroraCluster(positive, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(positive, 'rVpc') },
        iamAuthentication: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS6:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const vpc = new Vpc(negative, 'rVpc');
      new AuroraCluster(negative, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        iamAuthentication: true,
        instanceProps: { vpc: vpc },
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS6:'),
          }),
        })
      );
    });
    test('awsSolutionsRds10: RDS DB instances and Aurora DB clusters have deletion protection enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new AuroraCluster(positive, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(positive, 'rVpc') },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS10:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new RdsInstance(positive2, 'rDbInstance', {
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
            data: expect.stringContaining('AwsSolutions-RDS10:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const vpc = new Vpc(negative, 'rVpc');
      new AuroraCluster(negative, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: vpc },
        deletionProtection: true,
      });
      new RdsInstance(negative, 'rDbInstance', {
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
            data: expect.stringContaining('AwsSolutions-RDS10:'),
          }),
        })
      );
    });
    test('awsSolutionsRds11: RDS DB instances and Aurora DB clusters do not use the default endpoint ports', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new AuroraCluster(positive, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(positive, 'rVpc') },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS11:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new RdsInstance(positive2, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        port: 5432,
        vpc: new Vpc(positive2, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS11:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const vpc = new Vpc(negative, 'rVpc');
      new AuroraCluster(negative, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: vpc },
        port: 42,
      });
      new RdsInstance(negative, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
        port: 42,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS11:'),
          }),
        })
      );
    });
    test('awsSolutionsRds13: RDS DB instances and are configured for automated backups', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new RdsInstance(positive, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: new Vpc(positive, 'rVpc'),
        backupRetention: Duration.days(0),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS13:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const vpc = new Vpc(negative, 'rVpc');
      new RdsInstance(negative, 'rDbInstance', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
      });
      new RdsInstance(negative, 'rDbInstance2', {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13_2,
        }),
        vpc: vpc,
        backupRetention: Duration.days(1),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS13:'),
          }),
        })
      );
    });
    test('awsSolutionsRds14: RDS Aurora MySQL clusters have Backtrack enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new AuroraCluster(positive, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: new Vpc(positive, 'rVpc') },
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS14:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnAuroraCluster(negative, 'rDbCluster', {
        engine: 'aurora',
        backtrackWindow: 42,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS14:'),
          }),
        })
      );
    });
    test('AwsSolutions-RDS15: RDS Aurora DB clusters have Deletion Protection enabled', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new AwsSolutionsChecks());
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
            data: expect.stringContaining('AwsSolutions-RDS15:'),
          }),
        })
      );

      const compliant = new Stack();
      Aspects.of(compliant).add(new AwsSolutionsChecks());
      const vpc = new Vpc(compliant, 'rVpc');
      new AuroraCluster(compliant, 'rDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_5_7_12,
        }),
        instanceProps: { vpc: vpc },
        deletionProtection: true,
      });
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS15:'),
          }),
        })
      );
    });
    test('awsSolutionsRds16: RDS Aurora serverless clusters have all available Log Exports enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnAuroraCluster(positive, 'rDbCluster', {
        engine: 'aurora-mysql',
        engineMode: 'serverless',
        scalingConfiguration: {
          maxCapacity: 42,
          minCapacity: 7,
        },
        enableCloudwatchLogsExports: ['audit', 'error'],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS16:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnAuroraCluster(negative, 'rDbCluster', {
        engine: 'aurora-postgresql',
        engineMode: 'serverless',
        scalingConfiguration: {
          maxCapacity: 42,
          minCapacity: 7,
        },
      });
      new CfnAuroraCluster(negative, 'rDbCluster2', {
        engine: 'aurora-mysql',
        engineMode: 'serverless',
        scalingConfiguration: {
          maxCapacity: 42,
          minCapacity: 7,
        },
        enableCloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery'],
      });
      new CfnAuroraCluster(negative, 'rDbCluster3', {
        engine: 'aurora-mysql',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RDS16:'),
          }),
        })
      );
    });
  });
  describe('Amazon DynamoDB', () => {
    test('awsSolutionsDdb3: DynamoDB tables have point in time recovery enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Table(positive, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DDB3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Table(negative, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        pointInTimeRecovery: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DDB3:'),
          }),
        })
      );
    });
    test('awsSolutionsDdb4: DAX clusters have server-side encryption enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnDaxCluster(positive, 'rDax', {
        iamRoleArn: new Role(positive, 'rDAXRole', {
          assumedBy: new ServicePrincipal('dax.amazonaws.com'),
        }).roleArn,
        nodeType: 't3.small',
        replicationFactor: 3,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DDB4:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnDaxCluster(negative, 'rDax', {
        iamRoleArn: new Role(negative, 'rDAXRole', {
          assumedBy: new ServicePrincipal('dax.amazonaws.com'),
        }).roleArn,
        nodeType: 't3.small',
        replicationFactor: 7,
        sseSpecification: { sseEnabled: true },
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DDB4:'),
          }),
        })
      );
    });
  });
  describe('Amazon ElastiCache', () => {
    test('awsSolutionsAec1: ElastiCache clusters are provisioned in a VPC', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnCacheCluster(positive, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC1:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(positive2, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnCacheCluster(negative, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        cacheSubnetGroupName: 'lorem',
      });
      new CfnReplicationGroup(negative, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC1:'),
          }),
        })
      );
    });
    test('awsSolutionsAec3: ElastiCache Redis clusters have both encryption in transit and at rest enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(positive, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        atRestEncryptionEnabled: true,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(negative, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        atRestEncryptionEnabled: true,
        transitEncryptionEnabled: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC3:'),
          }),
        })
      );
    });
    test('awsSolutionsAec4: ElastiCache Redis clusters are deployed in a Multi-AZ configuration', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(positive, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC4:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(negative, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        multiAzEnabled: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC4:'),
          }),
        })
      );
    });
    test('awsSolutionsAec5: ElastiCache clusters do not use the default endpoint ports', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnCacheCluster(positive, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        port: 11211,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC1:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(positive2, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        port: 6379,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC5:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnCacheCluster(negative, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        port: 42,
      });
      new CfnReplicationGroup(negative, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        multiAzEnabled: true,
        port: 42,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC5:'),
          }),
        })
      );
    });
    test('awsSolutionsAec5: ElastiCache clusters do not use the default endpoint ports', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnCacheCluster(positive, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        port: 11211,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC1:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(positive2, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        port: 6379,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC5:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnCacheCluster(negative, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        port: 42,
      });
      new CfnReplicationGroup(negative, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        multiAzEnabled: true,
        port: 42,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC5:'),
          }),
        })
      );
    });
    test('awsSolutionsAec6: ElastiCache Redis clusters use Redis AUTH for user authentication', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(positive, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC5:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnReplicationGroup(negative, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        transitEncryptionEnabled: true,
        authToken: SecretValue.secretsManager('foo').toString(),
        port: 42,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AEC5:'),
          }),
        })
      );
    });
  });
  describe('Amazon Neptune', () => {
    test('awsSolutionsN1: Neptune DB clusters are deployed in a Multi-AZ configuration', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());

      new CfnNeptuneCluster(positive, 'rNeptuneCluster', {
        availabilityZones: ['us-east-1a'],
        dbSubnetGroupName: 'foo',
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new NeptuneCluster(negative, 'rNeptuneCluster', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N1:'),
          }),
        })
      );
    });
    test('awsSolutionsN2: Neptune DB instances have Auto Minor Version Upgrade enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());

      new NeptuneInstance(positive, 'rNeptuneInstance', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        cluster: new NeptuneCluster(positive, 'rNeptuneCluster', {
          instanceType: NeptuneInstanceType.R4_2XLARGE,
          vpc: new Vpc(positive, 'rVpc'),
        }),
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnNeptuneInstance(negative, 'rNeptuneInstance', {
        dbInstanceClass: 'db.r4.2xlarge',
        autoMinorVersionUpgrade: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N2:'),
          }),
        })
      );
    });
    test('awsSolutionsN3: Neptune DB clusters have a reasonable minimum backup retention period configured', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());

      new NeptuneCluster(positive, 'rNeptuneCluster', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        vpc: new Vpc(positive, 'rVpc'),
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new NeptuneCluster(negative, 'rNeptuneCluster', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        vpc: new Vpc(negative, 'rVpc'),
        backupRetention: Duration.days(42),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N3:'),
          }),
        })
      );
    });
    test('awsSolutionsN4: Neptune DB clusters have encryption at rest enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new NeptuneCluster(positive, 'rNeptuneCluster', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        vpc: new Vpc(positive, 'rVpc'),
        storageEncrypted: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N4:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new NeptuneCluster(negative, 'rNeptuneCluster', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        vpc: new Vpc(negative, 'rVpc'),
        storageEncrypted: true,
      });

      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N4:'),
          }),
        })
      );
    });
    test('awsSolutionsN5: Neptune DB clusters have IAM Database Authentication enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new NeptuneCluster(positive, 'rNeptuneCluster', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        vpc: new Vpc(positive, 'rVpc'),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N5:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new NeptuneCluster(negative, 'rNeptuneCluster', {
        instanceType: NeptuneInstanceType.R4_2XLARGE,
        vpc: new Vpc(negative, 'rVpc'),
        iamAuthentication: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-N5:'),
          }),
        })
      );
    });
  });
  describe('Amazon Redshift', () => {
    test('awsSolutionsRs1: Redshift cluster parameter groups must have the "require_ssl" parameter enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new ClusterParameterGroup(positive, 'rRedshiftParamGroup', {
        parameters: { auto_analyze: 'true' },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS1:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new ClusterParameterGroup(positive2, 'rRedshiftParamGroup', {
        parameters: {},
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS1:'),
          }),
        })
      );

      const positive3 = new Stack();
      Aspects.of(positive3).add(new AwsSolutionsChecks());
      new ClusterParameterGroup(positive3, 'rRedshiftParamGroup', {
        parameters: { auto_analyze: 'true', require_ssl: 'false' },
      });
      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS1:'),
          }),
        })
      );

      const positive4 = new Stack();
      Aspects.of(positive4).add(new AwsSolutionsChecks());
      new ClusterParameterGroup(positive4, 'rRedshiftParamGroup', {
        parameters: { require_ssl: 'false' },
      });
      const messages4 = SynthUtils.synthesize(positive4).messages;
      expect(messages4).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new ClusterParameterGroup(negative, 'rRedshiftParamGroup', {
        parameters: { auto_analyze: 'true', require_ssl: 'true' },
      });
      const messages5 = SynthUtils.synthesize(negative).messages;
      expect(messages5).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS1:'),
          }),
        })
      );
    });
    test('awsSolutionsRs2: Redshift clusters are provisioned in a VPC', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnRedshiftCluster(positive, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS2:'),
          }),
        })
      );
    });
    test('awsSolutionsRs3: Redshift clusters use custom user names vice the default (awsuser)', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnRedshiftCluster(positive, 'rRedshiftCluster', {
        masterUsername: 'awsuser',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        allowVersionUpgrade: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS3:'),
          }),
        })
      );
    });
    test('awsSolutionsRs4: Redshift clusters do not use the default endpoint port', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Cluster(positive, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(positive, 'rVpc'),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS4:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
        port: 42,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS4:'),
          }),
        })
      );
    });
    test('awsSolutionsRs5: Redshift clusters have audit logging enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Cluster(positive, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(positive, 'rVpc'),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS5:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
        loggingBucket: new Bucket(negative, 'rLoggingBucket'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS5:'),
          }),
        })
      );
    });
    test('awsSolutionsRs6: Redshift clusters have encryption at rest enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Cluster(positive, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(positive, 'rVpc'),
        encrypted: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS6:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS6:'),
          }),
        })
      );
    });
    test('awsSolutionsRs8: Redshift clusters are not publicly accessible', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Cluster(positive, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(positive, 'rVpc'),
        publiclyAccessible: true,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS8:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS8:'),
          }),
        })
      );
    });
    test('awsSolutionsRs9: Redshift clusters have version upgrade enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnRedshiftCluster(positive, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        allowVersionUpgrade: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS9:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS9:'),
          }),
        })
      );
    });
    test('awsSolutionsRs10: Redshift clusters have a retention period for automated snapshots configured', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnRedshiftCluster(positive, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        automatedSnapshotRetentionPeriod: 0,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS10:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rRedshiftCluster', {
        masterUser: { masterUsername: 'use_a_secret_here' },
        vpc: new Vpc(negative, 'rVpc'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-RS10:'),
          }),
        })
      );
    });
  });
  describe('Amazon DocumentDB (with MongoDB compatibility)', () => {
    test('awsSolutionsDoc1: Document DB clusters have encryption at rest enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new DocumentCluster(positive, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(positive, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
        storageEncrypted: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new DocumentCluster(negative, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(negative, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
        storageEncrypted: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC1:'),
          }),
        })
      );
    });
    test('awsSolutionsDoc2: Document DB clusters do not use the default endpoint port', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new DocumentCluster(positive, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(positive, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new DocumentCluster(negative, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(negative, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
        port: 42,
      });

      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC2:'),
          }),
        })
      );
    });
    test('awsSolutionsDoc3: Document DB clusters have the username and password stored in Secrets Manager', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new DocumentCluster(positive, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(positive, 'rVpc'),
        masterUser: {
          username: 'foo',
          password: SecretValue.secretsManager('bar'),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new DocumentCluster(negative, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(negative, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });

      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC3:'),
          }),
        })
      );
    });
    test('awsSolutionsDoc4: Document DB clusters have a reasonable minimum backup retention period configured', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new DocumentCluster(positive, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(positive, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC4:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new DocumentCluster(negative, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(negative, 'rVpc'),
        backup: { retention: Duration.days(7) },
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });

      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC4:'),
          }),
        })
      );
    });
    test('awsSolutionsDoc5: Document DB clusters have authenticate, createIndex, and dropCollection Log Exports enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new DocumentCluster(positive, 'rDocumentCluster', {
        instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
        vpc: new Vpc(positive, 'rVpc'),
        masterUser: {
          username: SecretValue.secretsManager('foo').toString(),
          password: SecretValue.secretsManager('bar'),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC5:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnDocumentCluster(positive2, 'rDocumentCluster', {
        masterUsername: SecretValue.secretsManager('foo').toString(),
        masterUserPassword: SecretValue.secretsManager('bar').toString(),
        enableCloudwatchLogsExports: ['authenticate', 'dropCollection'],
      });
      const messages2 = SynthUtils.synthesize(positive).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC5:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnDocumentCluster(negative, 'rDocumentCluster', {
        masterUsername: SecretValue.secretsManager('foo').toString(),
        masterUserPassword: SecretValue.secretsManager('bar').toString(),
        enableCloudwatchLogsExports: [
          'authenticate',
          'createIndex',
          'dropCollection',
        ],
      });

      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-DOC5:'),
          }),
        })
      );
    });
  });
});

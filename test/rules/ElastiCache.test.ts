/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  CfnCacheCluster,
  CfnReplicationGroup,
} from 'aws-cdk-lib/aws-elasticache';
import { Aspects, SecretValue, Stack } from 'aws-cdk-lib/core';
import {
  ElastiCacheClusterInVPC,
  ElastiCacheClusterNonDefaultPort,
  ElastiCacheRedisClusterAutomaticBackup,
  ElastiCacheRedisClusterEncryption,
  ElastiCacheRedisClusterMultiAZ,
  ElastiCacheRedisClusterRedisAuth,
} from '../../src/rules/elasticache';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  ElastiCacheClusterInVPC,
  ElastiCacheClusterNonDefaultPort,
  ElastiCacheRedisClusterAutomaticBackup,
  ElastiCacheRedisClusterEncryption,
  ElastiCacheRedisClusterMultiAZ,
  ElastiCacheRedisClusterRedisAuth,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon ElastiCache', () => {
  describe('ElastiCacheClusterInVPC: ElastiCache clusters are provisioned in a VPC', () => {
    const ruleId = 'ElastiCacheClusterInVPC';
    test('Noncompliance 1', () => {
      new CfnCacheCluster(stack, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCacheCluster(stack, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        cacheSubnetGroupName: 'lorem',
      });
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElastiCacheClusterNonDefaultPort: ElastiCache clusters do not use the default endpoint ports', () => {
    const ruleId = 'ElastiCacheClusterNonDefaultPort';
    test('Noncompliance 1', () => {
      new CfnCacheCluster(stack, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        port: 11211,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        port: 6379,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCacheCluster(stack, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 42,
        port: 42,
      });
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        multiAzEnabled: true,
        port: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElastiCacheRedisClusterAutomaticBackup: ElastiCache Redis clusters retain automatic backups for at least 15 days', () => {
    const ruleId = 'ElastiCacheRedisClusterAutomaticBackup';
    test('Noncompliance 1', () => {
      new CfnCacheCluster(stack, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        numCacheNodes: 42,
        snapshotRetentionLimit: 14,
        port: 11211,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnReplicationGroup(stack, 'rAecGroup', {
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCacheCluster(stack, 'rAec', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        numCacheNodes: 42,
        snapshotRetentionLimit: 16,
        port: 42,
      });
      new CfnReplicationGroup(stack, 'rAecGroup', {
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        snapshotRetentionLimit: 16,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElastiCacheRedisClusterEncryption: ElastiCache Redis clusters have both encryption in transit and at rest enabled', () => {
    const ruleId = 'ElastiCacheRedisClusterEncryption';
    test('Noncompliance 1', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        atRestEncryptionEnabled: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        atRestEncryptionEnabled: true,
        transitEncryptionEnabled: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElastiCacheRedisClusterMultiAZ: ElastiCache Redis clusters are deployed in a Multi-AZ configuration', () => {
    const ruleId = 'ElastiCacheRedisClusterMultiAZ';
    test('Noncompliance 1', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        multiAzEnabled: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElastiCacheRedisClusterRedisAuth: ElastiCache Redis clusters use Redis AUTH for user authentication', () => {
    const ruleId = 'ElastiCacheRedisClusterRedisAuth';
    test('Noncompliance 1', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnReplicationGroup(stack, 'rRedisGroup', {
        cacheNodeType: 'cache.t3.micro',
        replicationGroupDescription: 'lorem ipsum dolor sit amet',
        cacheSubnetGroupName: 'lorem',
        transitEncryptionEnabled: true,
        authToken: SecretValue.secretsManager('foo').toString(),
        port: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

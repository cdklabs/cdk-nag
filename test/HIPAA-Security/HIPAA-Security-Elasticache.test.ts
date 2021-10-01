/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('Amazon ElastiCache', () => {
  test('HIPAA.Security-ElastiCacheRedisClusterAutomaticBackup: ElastiCache Redis clusters retain automatic backups for at least 15 days', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnCacheCluster(nonCompliant, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 42,
      snapshotRetentionLimit: 14,
      port: 11211,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnReplicationGroup(nonCompliant2, 'rAecGroup', {
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new CfnCacheCluster(compliant, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 42,
      snapshotRetentionLimit: 16,
      port: 42,
    });
    new CfnReplicationGroup(compliant, 'rAecGroup', {
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      snapshotRetentionLimit: 16,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src/NIST-800-53/nist-800-53';

describe('Amazon Elasticache', () => {
  test('NIST.800.53-ElasticacheRedisClusterAutomaticBackup: ElastiCache Redis clusters retain automatic backups for at least 15 days', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053Checks());
    new CfnCacheCluster(positive, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 42,
      snapshotRetentionLimit: 14,
      port: 11211,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-ElasticacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const positive2 = new Stack();
    Aspects.of(positive2).add(new NIST80053Checks());
    new CfnReplicationGroup(positive2, 'rAecGroup', {
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
    });
    const messages2 = SynthUtils.synthesize(positive2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-ElasticacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053Checks());
    new CfnCacheCluster(negative, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 42,
      snapshotRetentionLimit: 16,
      port: 42,
    });
    new CfnReplicationGroup(negative, 'rAecGroup', {
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      snapshotRetentionLimit: 16,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-ElasticacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );
  });
});

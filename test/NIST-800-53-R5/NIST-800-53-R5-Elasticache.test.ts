/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnCacheCluster, CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon ElastiCache', () => {
  test('NIST.800.53.R5-ElastiCacheRedisClusterAutomaticBackup: - ElastiCache Redis clusters retain automatic backups for at least 15 days - (Control IDs: CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, SecretValue, Stack } from 'aws-cdk-lib';
import {
  CfnCacheCluster,
  CfnReplicationGroup,
} from 'aws-cdk-lib/aws-elasticache';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  ElastiCacheClusterInVPC,
  ElastiCacheClusterNonDefaultPort,
  ElastiCacheRedisClusterAutomaticBackup,
  ElastiCacheRedisClusterEncryption,
  ElastiCacheRedisClusterMultiAZ,
  ElastiCacheRedisClusterRedisAuth,
} from '../../src/rules/elasticache';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        ElastiCacheClusterInVPC,
        ElastiCacheClusterNonDefaultPort,
        ElastiCacheRedisClusterAutomaticBackup,
        ElastiCacheRedisClusterEncryption,
        ElastiCacheRedisClusterMultiAZ,
        ElastiCacheRedisClusterRedisAuth,
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('Amazon ElastiCache', () => {
  test('ElastiCacheClusterInVPC: ElastiCache clusters are provisioned in a VPC', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCacheCluster(nonCompliant, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'memcached',
      numCacheNodes: 42,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheClusterInVPC:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnReplicationGroup(nonCompliant2, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheClusterInVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCacheCluster(compliant, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'memcached',
      numCacheNodes: 42,
      cacheSubnetGroupName: 'lorem',
    });
    new CfnReplicationGroup(compliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheSubnetGroupName: 'lorem',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheClusterInVPC:'),
        }),
      })
    );
  });

  test('ElastiCacheClusterNonDefaultPort: ElastiCache clusters do not use the default endpoint ports', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCacheCluster(nonCompliant, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'memcached',
      numCacheNodes: 42,
      port: 11211,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheClusterNonDefaultPort:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnReplicationGroup(nonCompliant2, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      port: 6379,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheClusterNonDefaultPort:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCacheCluster(compliant, 'rAec', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'memcached',
      numCacheNodes: 42,
      port: 42,
    });
    new CfnReplicationGroup(compliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheSubnetGroupName: 'lorem',
      multiAzEnabled: true,
      port: 42,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheClusterNonDefaultPort:'),
        }),
      })
    );
  });

  test('ElastiCacheRedisClusterAutomaticBackup: ElastiCache Redis clusters retain automatic backups for at least 15 days', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
            'ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
            'ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
            'ElastiCacheRedisClusterAutomaticBackup:'
          ),
        }),
      })
    );
  });

  test('ElastiCacheRedisClusterEncryption: ElastiCache Redis clusters have both encryption in transit and at rest enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnReplicationGroup(nonCompliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      atRestEncryptionEnabled: true,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheRedisClusterEncryption:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnReplicationGroup(compliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheSubnetGroupName: 'lorem',
      atRestEncryptionEnabled: true,
      transitEncryptionEnabled: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheRedisClusterEncryption:'),
        }),
      })
    );
  });

  test('ElastiCacheRedisClusterMultiAZ: ElastiCache Redis clusters are deployed in a Multi-AZ configuration', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnReplicationGroup(nonCompliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheRedisClusterMultiAZ:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnReplicationGroup(compliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheSubnetGroupName: 'lorem',
      multiAzEnabled: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheRedisClusterMultiAZ:'),
        }),
      })
    );
  });

  test('ElastiCacheRedisClusterRedisAuth: ElastiCache Redis clusters use Redis AUTH for user authentication', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnReplicationGroup(nonCompliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheRedisClusterRedisAuth:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnReplicationGroup(compliant, 'rRedisGroup', {
      cacheNodeType: 'cache.t3.micro',
      replicationGroupDescription: 'lorem ipsum dolor sit amet',
      cacheSubnetGroupName: 'lorem',
      transitEncryptionEnabled: true,
      authToken: SecretValue.secretsManager('foo').toString(),
      port: 42,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElastiCacheRedisClusterRedisAuth:'),
        }),
      })
    );
  });
});

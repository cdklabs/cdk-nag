/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDBCluster, CfnDBInstance } from 'aws-cdk-lib/aws-neptune';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  NeptuneClusterAutomaticMinorVersionUpgrade,
  NeptuneClusterBackupRetentionPeriod,
  NeptuneClusterEncryptionAtRest,
  NeptuneClusterIAMAuth,
  NeptuneClusterMultiAZ,
} from '../../src/rules/neptune';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        NeptuneClusterAutomaticMinorVersionUpgrade,
        NeptuneClusterBackupRetentionPeriod,
        NeptuneClusterEncryptionAtRest,
        NeptuneClusterIAMAuth,
        NeptuneClusterMultiAZ,
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

describe('Amazon Neptune', () => {
  test('NeptuneClusterAutomaticMinorVersionUpgrade: Neptune DB instances have Auto Minor Version Upgrade enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBInstance(nonCompliant, 'rDatabaseInstance', {
      dbInstanceClass: 'db.r4.2xlarge',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NeptuneClusterAutomaticMinorVersionUpgrade:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBInstance(compliant, 'rDatabaseInstance', {
      dbInstanceClass: 'db.r4.2xlarge',
      autoMinorVersionUpgrade: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NeptuneClusterAutomaticMinorVersionUpgrade:'
          ),
        }),
      })
    );
  });

  test('NeptuneClusterBackupRetentionPeriod: Neptune DB clusters have a reasonable minimum backup retention period configured', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBCluster(nonCompliant, 'rDatabaseCluster');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterBackupRetentionPeriod:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBCluster(compliant, 'rDatabaseCluster', {
      backupRetentionPeriod: 7,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterBackupRetentionPeriod:'),
        }),
      })
    );
  });

  test('NeptuneClusterEncryptionAtRest: Neptune DB clusters have encryption at rest enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBCluster(nonCompliant, 'rDatabaseCluster', {
      storageEncrypted: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterEncryptionAtRest:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBCluster(compliant, 'rDatabaseCluster', { storageEncrypted: true });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterEncryptionAtRest:'),
        }),
      })
    );
  });

  test('NeptuneClusterIAMAuth: Neptune DB clusters have IAM Database Authentication enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBCluster(nonCompliant, 'rDatabaseCluster');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterIAMAuth:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBCluster(compliant, 'rDatabaseCluster', {
      iamAuthEnabled: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterIAMAuth:'),
        }),
      })
    );
  });

  test('NeptuneClusterMultiAZ: Neptune DB clusters are deployed in a Multi-AZ configuration', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDBCluster(nonCompliant, 'rDatabaseCluster', {
      availabilityZones: ['us-east-1a'],
      dbSubnetGroupName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterMultiAZ:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBCluster(compliant, 'rDatabaseCluster', {
      availabilityZones: ['us-east-1a', 'us-east-1b'],
      dbSubnetGroupName: 'foo',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NeptuneClusterMultiAZ:'),
        }),
      })
    );
  });
});

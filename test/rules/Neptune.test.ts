/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  CfnDBCluster,
  CfnDBInstance,
  DatabaseCluster,
  DatabaseInstance,
  InstanceType,
} from '@aws-cdk/aws-neptune';
import {
  Aspects,
  CfnResource,
  Duration,
  IConstruct,
  Stack,
} from '@aws-cdk/core';
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

    new DatabaseInstance(nonCompliant, 'rDatabaseInstance', {
      instanceType: InstanceType.R4_2XLARGE,
      cluster: new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
        instanceType: InstanceType.R4_2XLARGE,
        vpc: new Vpc(nonCompliant, 'rVpc'),
      }),
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

    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.R4_2XLARGE,
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });

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
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.R4_2XLARGE,
      vpc: new Vpc(compliant, 'rVpc'),
      backupRetention: Duration.days(42),
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
    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.R4_2XLARGE,
      vpc: new Vpc(nonCompliant, 'rVpc'),
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
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.R4_2XLARGE,
      vpc: new Vpc(compliant, 'rVpc'),
      storageEncrypted: true,
    });

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
    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.R4_2XLARGE,
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
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
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.R4_2XLARGE,
      vpc: new Vpc(compliant, 'rVpc'),
      iamAuthentication: true,
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
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.R4_2XLARGE,
      vpc: new Vpc(compliant, 'rVpc'),
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnDBCluster, DatabaseCluster } from '@aws-cdk/aws-docdb';
import {
  InstanceType,
  InstanceClass,
  InstanceSize,
  Vpc,
} from '@aws-cdk/aws-ec2';
import {
  Aspects,
  CfnResource,
  Duration,
  IConstruct,
  SecretValue,
  Stack,
} from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  DocumentDBClusterBackupRetentionPeriod,
  DocumentDBClusterEncryptionAtRest,
  DocumentDBClusterLogExports,
  DocumentDBClusterNonDefaultPort,
  DocumentDBCredentialsInSecretsManager,
} from '../../src/rules/documentdb';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        DocumentDBClusterBackupRetentionPeriod,
        DocumentDBClusterEncryptionAtRest,
        DocumentDBClusterLogExports,
        DocumentDBClusterNonDefaultPort,
        DocumentDBCredentialsInSecretsManager,
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

describe('Amazon DocumentDB (with MongoDB compatibility)', () => {
  test('DocumentDBClusterEncryptionAtRest: Document DB clusters have encryption at rest enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(nonCompliant, 'rVpc'),
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
      storageEncrypted: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DocumentDBClusterEncryptionAtRest:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(compliant, 'rVpc'),
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
      storageEncrypted: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DocumentDBClusterEncryptionAtRest:'),
        }),
      })
    );
  });

  test('DocumentDBClusterNonDefaultPort: Document DB clusters do not use the default endpoint port', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(nonCompliant, 'rVpc'),
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DocumentDBClusterNonDefaultPort:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(compliant, 'rVpc'),
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
      port: 42,
    });

    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DocumentDBClusterNonDefaultPort:'),
        }),
      })
    );
  });

  test('DocumentDBCredentialsInSecretsManager: Document DB clusters have the username and password stored in Secrets Manager', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(nonCompliant, 'rVpc'),
      masterUser: {
        username: 'foo',
        password: SecretValue.secretsManager('bar'),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'DocumentDBCredentialsInSecretsManager:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(compliant, 'rVpc'),
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
    });

    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'DocumentDBCredentialsInSecretsManager:'
          ),
        }),
      })
    );
  });

  test('DocumentDBClusterBackupRetentionPeriod: Document DB clusters have a reasonable minimum backup retention period configured', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(nonCompliant, 'rVpc'),
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'DocumentDBClusterBackupRetentionPeriod:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new DatabaseCluster(compliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(compliant, 'rVpc'),
      backup: { retention: Duration.days(7) },
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
    });

    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'DocumentDBClusterBackupRetentionPeriod:'
          ),
        }),
      })
    );
  });

  test('DocumentDBClusterLogExports: Document DB clusters have authenticate, createIndex, and dropCollection Log Exports enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new DatabaseCluster(nonCompliant, 'rDatabaseCluster', {
      instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
      vpc: new Vpc(nonCompliant, 'rVpc'),
      masterUser: {
        username: SecretValue.secretsManager('foo').toString(),
        password: SecretValue.secretsManager('bar'),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DocumentDBClusterLogExports:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnDBCluster(nonCompliant2, 'rDatabaseCluster', {
      masterUsername: SecretValue.secretsManager('foo').toString(),
      masterUserPassword: SecretValue.secretsManager('bar').toString(),
      enableCloudwatchLogsExports: ['authenticate', 'dropCollection'],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DocumentDBClusterLogExports:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDBCluster(compliant, 'rDatabaseCluster', {
      masterUsername: SecretValue.secretsManager('foo').toString(),
      masterUserPassword: SecretValue.secretsManager('bar').toString(),
      enableCloudwatchLogsExports: [
        'authenticate',
        'createIndex',
        'dropCollection',
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DocumentDBClusterLogExports:'),
        }),
      })
    );
  });
});

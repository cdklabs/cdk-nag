/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  ScalableTarget,
  ServiceNamespace,
} from '@aws-cdk/aws-applicationautoscaling';
import { BackupPlan, BackupResource } from '@aws-cdk/aws-backup';
import { CfnCluster } from '@aws-cdk/aws-dax';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  DAXEncrypted,
  DynamoDBAutoScalingEnabled,
  DynamoDBInBackupPlan,
  DynamoDBPITREnabled,
} from '../../src/rules/dynamodb';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        DAXEncrypted,
        DynamoDBAutoScalingEnabled,
        DynamoDBInBackupPlan,
        DynamoDBPITREnabled,
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

describe('Amazon DynamoDB', () => {
  test('DAXEncrypted: DAX clusters have server-side encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rDax', {
      iamRoleArn: new Role(nonCompliant, 'rDAXRole', {
        assumedBy: new ServicePrincipal('dax.amazonaws.com'),
      }).roleArn,
      nodeType: 't3.small',
      replicationFactor: 3,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DAXEncrypted:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rDax', {
      iamRoleArn: new Role(compliant, 'rDAXRole', {
        assumedBy: new ServicePrincipal('dax.amazonaws.com'),
      }).roleArn,
      nodeType: 't3.small',
      replicationFactor: 7,
      sseSpecification: { sseEnabled: true },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DAXEncrypted:'),
        }),
      })
    );
  });
  test('DynamoDBAutoScalingEnabled: Provisioned capacity DynamoDB tables have auto-scaling enabled on their indexes', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBAutoScalingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    const nonCompliant2Table = new Table(nonCompliant2, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    nonCompliant2Table.autoScaleReadCapacity({
      minCapacity: 7,
      maxCapacity: 42,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBAutoScalingEnabled:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack({ verbose: true }));
    const nonCompliant3Table = new Table(nonCompliant3, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    nonCompliant3Table.addGlobalSecondaryIndex({
      indexName: 'bar',
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    nonCompliant3Table.autoScaleReadCapacity({
      minCapacity: 7,
      maxCapacity: 42,
    });
    nonCompliant3Table.autoScaleWriteCapacity({
      minCapacity: 7,
      maxCapacity: 42,
    });
    nonCompliant3Table.autoScaleGlobalSecondaryIndexReadCapacity('bar', {
      minCapacity: 7,
      maxCapacity: 42,
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBAutoScalingEnabled:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack({ verbose: true }));
    const nonCompliant4Table = new Table(nonCompliant4, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      tableName: 'baz',
    });
    nonCompliant4Table.addGlobalSecondaryIndex({
      indexName: 'bar',
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    nonCompliant4Table.autoScaleReadCapacity({
      minCapacity: 7,
      maxCapacity: 42,
    });
    nonCompliant4Table.autoScaleWriteCapacity({
      minCapacity: 7,
      maxCapacity: 42,
    });
    nonCompliant4Table.autoScaleGlobalSecondaryIndexReadCapacity('bar', {
      minCapacity: 7,
      maxCapacity: 42,
    });
    new ScalableTarget(nonCompliant4, 'rCompliantTable3GSIWriteTarget', {
      serviceNamespace: ServiceNamespace.DYNAMODB,
      scalableDimension: 'dynamodb:index:WriteCapacityUnits',
      resourceId: 'table/baz/index/barbaz',
      minCapacity: 7,
      maxCapacity: 42,
    });
    new ScalableTarget(nonCompliant4, 'rCompliantTable3GSIWriteTarget2', {
      serviceNamespace: ServiceNamespace.DYNAMODB,
      scalableDimension: 'dynamodb:index:WriteCapacityUnits',
      resourceId: 'table/baz/index/bazbar',
      minCapacity: 7,
      maxCapacity: 42,
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBAutoScalingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Table(compliant, 'rTable1', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    const compliantTable2 = new Table(compliant, 'rTable2', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    compliantTable2.autoScaleReadCapacity({ minCapacity: 7, maxCapacity: 42 });
    compliantTable2.autoScaleWriteCapacity({ minCapacity: 7, maxCapacity: 42 });
    const compliantTable3 = new Table(compliant, 'rTable3', {
      tableName: 'baz',
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    compliantTable3.addGlobalSecondaryIndex({
      indexName: 'bar',
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    compliantTable3.autoScaleReadCapacity({ minCapacity: 7, maxCapacity: 43 });
    compliantTable3.autoScaleWriteCapacity({ minCapacity: 7, maxCapacity: 43 });
    compliantTable3.autoScaleGlobalSecondaryIndexReadCapacity('bar', {
      minCapacity: 7,
      maxCapacity: 42,
    });
    new ScalableTarget(compliant, 'rCompliantTable3GSIWriteTarget', {
      serviceNamespace: ServiceNamespace.DYNAMODB,
      scalableDimension: 'dynamodb:index:WriteCapacityUnits',
      resourceId: 'table/baz/index/bar',
      minCapacity: 7,
      maxCapacity: 42,
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBAutoScalingEnabled:'),
        }),
      })
    );
  });

  test('DynamoDBInBackupPlan: DynamoDB tables are part of AWS Backup plan(s)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      tableName: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBInBackupPlan:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Table(nonCompliant2, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      tableName: 'bar',
    });
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      nonCompliant2,
      'rPlan'
    ).addSelection('Selection', {
      resources: [
        BackupResource.fromDynamoDbTable(
          Table.fromTableName(nonCompliant2, 'rTableImport1', 'Xbar')
        ),
        BackupResource.fromDynamoDbTable(
          Table.fromTableName(nonCompliant2, 'rTableImport2', 'barX')
        ),
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBInBackupPlan:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const compliantTable = new Table(compliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      compliant,
      'rPlan'
    ).addSelection('Selection', {
      resources: [BackupResource.fromDynamoDbTable(compliantTable)],
    });
    new Table(compliant, 'rTable2', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      tableName: 'bar',
    });
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      compliant,
      'rPlan2'
    ).addSelection('Selection', {
      resources: [
        BackupResource.fromDynamoDbTable(
          Table.fromTableName(compliant, 'rTable2Import', 'bar')
        ),
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBInBackupPlan:'),
        }),
      })
    );
  });

  test('DynamoDBPITREnabled: DynamoDB tables have point in time recovery enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBPITREnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Table(compliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DynamoDBPITREnabled:'),
        }),
      })
    );
  });
});

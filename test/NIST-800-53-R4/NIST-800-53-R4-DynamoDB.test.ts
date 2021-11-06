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
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon DynamoDB', () => {
  test('NIST.800.53.R4-DynamoDBAutoscalingEnabled: - Provisioned capacity DynamoDB tables have auto-scaling enabled on their indexes - (Control IDs: CP-10, SC-5)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R4-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R4Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R4-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R4Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R4-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R4-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53.R4-DynamoDBInBackupPlan: - DynamoDB tables are part of AWS Backup plan(s) - (Control IDs: CP-9(b), CP-10, SI-12)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      tableName: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-DynamoDBInBackupPlan:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-DynamoDBInBackupPlan:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-DynamoDBInBackupPlan:'),
        }),
      })
    );
  });
  test('NIST.800.53.R4-DynamoDBPITREnabled: - DynamoDB tables have point in time recovery enabled - (Control IDs: CP-9(b), CP-10, SI-12)', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new Table(positive, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-DynamoDBPITREnabled:'),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    new Table(negative, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-DynamoDBPITREnabled:'),
        }),
      })
    );
  });
});

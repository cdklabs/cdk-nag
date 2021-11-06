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
import { HIPAASecurityChecks } from '../../src';

describe('Amazon DynamoDB', () => {
  test('HIPAA.Security-DynamoDBAutoscalingEnabled: - Provisioned capacity DynamoDB tables have auto-scaling enabled on their indexes - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks({ verbose: true }));
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
            'HIPAA.Security-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new HIPAASecurityChecks({ verbose: true }));
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
            'HIPAA.Security-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-DynamoDBAutoscalingEnabled:'
          ),
        }),
      })
    );
  });
  test('HIPAA.Security-DynamoDBInBackupPlan: - DynamoDB tables are part of AWS Backup plan(s) - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      tableName: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-DynamoDBInBackupPlan:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-DynamoDBInBackupPlan:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-DynamoDBInBackupPlan:'),
        }),
      })
    );
  });

  test('HIPAA.Security-DynamoDBPITREnabled: - DynamoDB tables have point in time recovery enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Table(nonCompliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-DynamoDBPITREnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Table(compliant, 'rTable', {
      partitionKey: { name: 'foo', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-DynamoDBPITREnabled:'),
        }),
      })
    );
  });
});

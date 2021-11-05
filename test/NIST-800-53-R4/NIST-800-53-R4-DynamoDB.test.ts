/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { BackupPlan, BackupResource } from '@aws-cdk/aws-backup';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon DynamoDB', () => {
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

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  ScalableTarget,
  ServiceNamespace,
} from 'aws-cdk-lib/aws-applicationautoscaling';
import { BackupPlan, BackupResource } from 'aws-cdk-lib/aws-backup';
import { CfnCluster } from 'aws-cdk-lib/aws-dax';
import {
  AttributeType,
  BillingMode,
  CfnTable,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  DAXEncrypted,
  DynamoDBAutoScalingEnabled,
  DynamoDBInBackupPlan,
  DynamoDBPITREnabled,
} from '../../src/rules/dynamodb';

const testPack = new TestPack([
  DAXEncrypted,
  DynamoDBAutoScalingEnabled,
  DynamoDBInBackupPlan,
  DynamoDBPITREnabled,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon DynamoDB', () => {
  describe('DAXEncrypted: DAX clusters have server-side encryption enabled', () => {
    const ruleId = 'DAXEncrypted';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rDax', {
        iamRoleArn: new Role(stack, 'rDAXRole', {
          assumedBy: new ServicePrincipal('dax.amazonaws.com'),
        }).roleArn,
        nodeType: 't3.small',
        replicationFactor: 3,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2: sseSpecification not enabled', () => {
      new CfnCluster(stack, 'Dax', {
        iamRoleArn: new Role(stack, 'DAXRole', {
          assumedBy: new ServicePrincipal('dax.amazonaws.com'),
        }).roleArn,
        nodeType: 't3.small',
        replicationFactor: 3,
        sseSpecification: { sseEnabled: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnCluster(stack, 'rDax', {
        iamRoleArn: new Role(stack, 'rDAXRole', {
          assumedBy: new ServicePrincipal('dax.amazonaws.com'),
        }).roleArn,
        nodeType: 't3.small',
        replicationFactor: 7,
        sseSpecification: { sseEnabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('DynamoDBAutoScalingEnabled: Provisioned capacity DynamoDB tables have auto-scaling enabled on their indexes', () => {
    const ruleId = 'DynamoDBAutoScalingEnabled';
    test('Noncompliance 1', () => {
      new Table(stack, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      const nonCompliant2Table = new Table(stack, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      nonCompliant2Table.autoScaleReadCapacity({
        minCapacity: 7,
        maxCapacity: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      const nonCompliant3Table = new Table(stack, 'rTable', {
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      const nonCompliant4Table = new Table(stack, 'rTable', {
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
      new ScalableTarget(stack, 'rCompliantTable3GSIWriteTarget', {
        serviceNamespace: ServiceNamespace.DYNAMODB,
        scalableDimension: 'dynamodb:index:WriteCapacityUnits',
        resourceId: 'table/baz/index/barbaz',
        minCapacity: 7,
        maxCapacity: 42,
      });
      new ScalableTarget(stack, 'rCompliantTable3GSIWriteTarget2', {
        serviceNamespace: ServiceNamespace.DYNAMODB,
        scalableDimension: 'dynamodb:index:WriteCapacityUnits',
        resourceId: 'table/baz/index/bazbar',
        minCapacity: 7,
        maxCapacity: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5: pointInTimeRecoveryEnabled false', () => {
      new CfnTable(stack, 'Table', {
        keySchema: [{ keyType: 'HASH', attributeName: 'foo' }],
        pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Table(stack, 'rTable1', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
      });
      const compliantTable2 = new Table(stack, 'rTable2', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      compliantTable2.autoScaleReadCapacity({
        minCapacity: 7,
        maxCapacity: 42,
      });
      compliantTable2.autoScaleWriteCapacity({
        minCapacity: 7,
        maxCapacity: 42,
      });
      const compliantTable3 = new Table(stack, 'rTable3', {
        tableName: 'baz',
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      compliantTable3.addGlobalSecondaryIndex({
        indexName: 'bar',
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      compliantTable3.autoScaleReadCapacity({
        minCapacity: 7,
        maxCapacity: 43,
      });
      compliantTable3.autoScaleWriteCapacity({
        minCapacity: 7,
        maxCapacity: 43,
      });
      compliantTable3.autoScaleGlobalSecondaryIndexReadCapacity('bar', {
        minCapacity: 7,
        maxCapacity: 42,
      });
      new ScalableTarget(stack, 'rCompliantTable3GSIWriteTarget', {
        serviceNamespace: ServiceNamespace.DYNAMODB,
        scalableDimension: 'dynamodb:index:WriteCapacityUnits',
        resourceId: 'table/baz/index/bar',
        minCapacity: 7,
        maxCapacity: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('DynamoDBInBackupPlan: DynamoDB tables are part of AWS Backup plan(s)', () => {
    const ruleId = 'DynamoDBInBackupPlan';
    test('Noncompliance 1', () => {
      new Table(stack, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        tableName: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Table(stack, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        tableName: 'bar',
      });
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan').addSelection(
        'Selection',
        {
          resources: [
            BackupResource.fromDynamoDbTable(
              Table.fromTableName(stack, 'rTableImport1', 'Xbar')
            ),
            BackupResource.fromDynamoDbTable(
              Table.fromTableName(stack, 'rTableImport2', 'barX')
            ),
          ],
        }
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantTable = new Table(stack, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan').addSelection(
        'Selection',
        {
          resources: [BackupResource.fromDynamoDbTable(compliantTable)],
        }
      );
      new Table(stack, 'rTable2', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        tableName: 'bar',
      });
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan2').addSelection(
        'Selection',
        {
          resources: [
            BackupResource.fromDynamoDbTable(
              Table.fromTableName(stack, 'rTable2Import', 'bar')
            ),
          ],
        }
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('DynamoDBPITREnabled: DynamoDB tables have point in time recovery enabled', () => {
    const ruleId = 'DynamoDBPITREnabled';
    test('Noncompliance 1', () => {
      new Table(stack, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Table(stack, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        pointInTimeRecovery: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

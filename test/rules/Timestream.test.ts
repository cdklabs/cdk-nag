/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDatabase } from 'aws-cdk-lib/aws-timestream';
import { Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack, setActivePack } from './utils';
import { TimestreamDatabaseCustomerManagedKey } from '../../src/rules/timestream';

const testPack = new TestPack([TimestreamDatabaseCustomerManagedKey]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  setActivePack(testPack);
});

describe('Amazon Timestream', () => {
  describe('TimestreamDatabaseCustomerManagedKey: Timestream databases use Customer Managed KMS Keys', () => {
    const ruleId = 'TimestreamDatabaseCustomerManagedKey';
    test('Noncompliance 1', () => {
      new CfnDatabase(stack, 'rTimestreamDb');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDatabase(stack, 'rTimestreamDb', {
        kmsKeyId: 'foo',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

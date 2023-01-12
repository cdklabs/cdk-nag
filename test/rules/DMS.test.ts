/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnReplicationInstance } from 'aws-cdk-lib/aws-dms';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import { DMSReplicationNotPublic } from '../../src/rules/dms';

const testPack = new TestPack([DMSReplicationNotPublic]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Database Migration Service (AWS DMS)', () => {
  describe('DMSReplicationNotPublic: DMS replication instances are not public', () => {
    const ruleId = 'DMSReplicationNotPublic';
    test('Noncompliance 1', () => {
      new CfnReplicationInstance(stack, 'rInstance', {
        replicationInstanceClass: 'dms.t2.micro',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnReplicationInstance(stack, 'rInstance', {
        replicationInstanceClass: 'dms.t2.micro',
        publiclyAccessible: false,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

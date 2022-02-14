/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDataSource } from '@aws-cdk/aws-quicksight';
import { Aspects, Stack } from '@aws-cdk/core';
import { QuicksightSSLConnections } from '../../src/rules/quicksight';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([QuicksightSSLConnections]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon QuickSight', () => {
  describe('QuicksightSSLConnections: Quicksight data sources connections are configured to use SSL', () => {
    const ruleId = 'QuicksightSSLConnections';
    test('Noncompliance 1', () => {
      new CfnDataSource(stack, 'rDashboard', {
        sslProperties: { disableSsl: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDataSource(stack, 'rDashboard', {
        sslProperties: { disableSsl: false },
      });
      new CfnDataSource(stack, 'rDashboard2', {
        sslProperties: {},
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

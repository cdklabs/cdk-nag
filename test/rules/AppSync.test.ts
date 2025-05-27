/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnGraphQLApi } from 'aws-cdk-lib/aws-appsync';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  AppSyncGraphQLRequestLogging,
  AppSyncTracing,
} from '../../src/rules/appsync';

const testPack = new TestPack([AppSyncGraphQLRequestLogging, AppSyncTracing]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS AppSync', () => {
  describe('AppSyncGraphQLRequestLogging: GraphQL APIs have request leveling logging enabled', () => {
    const ruleId = 'AppSyncGraphQLRequestLogging';
    test('Noncompliance 1', () => {
      new CfnGraphQLApi(stack, 'GraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOL',
        name: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnGraphQLApi(stack, 'GraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOL',
        name: 'foo',
        logConfig: { excludeVerboseContent: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnGraphQLApi(stack, 'GraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOL',
        name: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnGraphQLApi(stack, 'GraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOL',
        name: 'foo',
        logConfig: { cloudWatchLogsRoleArn: 'foo' },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('AppSyncTracing: GraphQL APIs have X-Ray tracing enabled', () => {
    const ruleId = 'AppSyncTracing';
    test('Noncompliance 1', () => {
      new CfnGraphQLApi(stack, 'GraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
        name: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance - L1 Construct', () => {
      new CfnGraphQLApi(stack, 'GraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
        name: 'foo',
        xrayEnabled: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnGraphQLApi } from '@aws-cdk/aws-appsync';
import { Aspects, Stack } from '@aws-cdk/core';
import { AppSyncGraphQLRequestLogging } from '../../src/rules/appsync';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([AppSyncGraphQLRequestLogging]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS AppSync', () => {
  describe('AppSyncGraphQLRequestLogging: GraphQL APIs have request leveling logging enabled', () => {
    const ruleId = 'AppSyncGraphQLRequestLogging';
    test('Noncompliance 1', () => {
      new CfnGraphQLApi(stack, 'rGraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOL',
        name: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnGraphQLApi(stack, 'rGraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOL',
        name: 'foo',
        logConfig: { excludeVerboseContent: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnGraphQLApi(stack, 'rGraphqlApi', {
        authenticationType: 'AMAZON_COGNITO_USER_POOL',
        name: 'foo',
        logConfig: { cloudWatchLogsRoleArn: 'foo' },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

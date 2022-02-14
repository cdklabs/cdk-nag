/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Repository } from '@aws-cdk/aws-ecr';
import {
  PolicyStatement,
  Effect,
  AccountPrincipal,
  AccountRootPrincipal,
} from '@aws-cdk/aws-iam';
import { Aspects, Stack } from '@aws-cdk/core';
import { ECROpenAccess } from '../../src/rules/ecr';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([ECROpenAccess]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Elastic Container Registry (ECR)', () => {
  describe('ECROpenAccess: ECR Repositories do not allow open access', () => {
    const ruleId = 'ECROpenAccess';
    test('Noncompliance 1', () => {
      const repo = new Repository(stack, 'rRepo');
      repo.addToResourcePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['*'],
          principals: [new AccountPrincipal('*'), new AccountRootPrincipal()],
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Repository(stack, 'rRepo');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

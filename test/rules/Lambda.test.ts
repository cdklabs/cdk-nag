/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnFunction, Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  LambdaConcurrency,
  LambdaDLQ,
  LambdaInsideVPC,
  LambdaLatestVersion,
} from '../../src/rules/lambda';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  LambdaConcurrency,
  LambdaDLQ,
  LambdaInsideVPC,
  LambdaLatestVersion,
]);
let stack: Stack;

function getLatestRuntime(family: string): Runtime {
  const familyVersions = Runtime.ALL.filter(
    (rt) => rt.toString().indexOf(family) === 0
  )
    .map((rt) => {
      let match = rt.toString().match(/([a-z]+)(\d+(\.?\d+|\.x)?)?/);
      return {
        value: rt,
        family: match![1],
        version: parseFloat(match![2]),
      };
    })
    .sort((a, b) => {
      if (a.version < b.version) return -1;
      else if (a.version > b.version) return 1;
      else return 0;
    });

  return familyVersions.pop()!.value;
}

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Lambda', () => {
  describe('LambdaConcurrency: Lambda functions are configured with function-level concurrent execution limits', () => {
    const ruleId = 'LambdaConcurrency';
    test('Noncompliance 1', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
        reservedConcurrentExecutions: 0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
        reservedConcurrentExecutions: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('LambdaDLQ: Lambda functions are configured with a dead-letter configuration', () => {
    const ruleId = 'LambdaDLQ';
    test('Noncompliance 1', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
        deadLetterConfig: {},
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
        deadLetterConfig: { targetArn: 'mySnsTopicArn' },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('LambdaInsideVPC: Lambda functions are VPC enabled', () => {
    const ruleId = 'LambdaInsideVPC';
    test('Noncompliance 1', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnFunction(stack, 'rFunction', {
        code: {},
        role: 'somerole',
        vpcConfig: {
          securityGroupIds: [],
          subnetIds: [],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnFunction(stack, 'rFunction1', {
        code: {},
        role: 'somerole',
        vpcConfig: {
          securityGroupIds: ['somesecgroup'],
        },
      });
      new CfnFunction(stack, 'rFunction2', {
        code: {},
        role: 'somerole',
        vpcConfig: {
          subnetIds: ['somesecgroup'],
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('LambdaLatestVersion: Lambda functions use the latest runtime version', () => {
    const ruleId = 'LambdaLatestVersion';
    test('Noncompliance 1 - nodejs', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: Runtime.NODEJS_12_X.toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2 - python', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: Runtime.PYTHON_3_8.toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3 - dotnet', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: Runtime.DOTNET_CORE_2_1.toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4 - java', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: Runtime.JAVA_8_CORRETTO.toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5 - L2 - nodejs', () => {
      new Function(stack, 'rFunction', {
        runtime: Runtime.NODEJS_12_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1 - nodejs', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: getLatestRuntime('nodejs').toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 2 - python', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: getLatestRuntime('python').toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 3 - dotnet', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: getLatestRuntime('dotnetcore').toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 4 - java', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: getLatestRuntime('java').toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 5 - go', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: getLatestRuntime('go').toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 6 - provided', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: Runtime.PROVIDED.toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 6 - unknown', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: 'unknown',
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 7 - L2 - nodejs', () => {
      new Function(stack, 'rFunction', {
        runtime: getLatestRuntime('nodejs'),
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

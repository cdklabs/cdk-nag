/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Repository } from '@aws-cdk/aws-ecr';
import { CfnRole, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import {
  CfnFunction,
  Code,
  DockerImageCode,
  DockerImageFunction,
  Function,
  Runtime,
} from '@aws-cdk/aws-lambda';
import { Aspects, Fn, Stack } from '@aws-cdk/core';
import {
  LambdaConcurrency,
  LambdaDLQ,
  LambdaInsideVPC,
  LambdaLatestVersion,
  LambdaSharedRole,
} from '../../src/rules/lambda';
import { TestPack, TestType, validateStack } from './utils';

const testPack = new TestPack(
  [
    LambdaConcurrency,
    LambdaDLQ,
    LambdaInsideVPC,
    LambdaLatestVersion,
    LambdaSharedRole,
  ],
  { verbose: true }
);
let stack: Stack;

function getLatestRuntime(family: string): Runtime {
  const familyVersions = Runtime.ALL.filter(
    (rt) => rt.toString().indexOf(family) === 0
  )
    .map((rt) => {
      let match = rt.toString().match(/^([a-z]+)(\d+(\.?\d+|\.x)?)?.*$/);
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

  describe('LambdaLatestVersion: Non-container Lambda functions use the latest runtime version', () => {
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
    test('Compliance 7 - L2 - nodejs', () => {
      new Function(stack, 'rFunction', {
        runtime: getLatestRuntime('nodejs'),
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 8 - L2 - container', () => {
      new DockerImageFunction(stack, 'rFunction', {
        code: DockerImageCode.fromEcr(new Repository(stack, 'rRepo')),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Validation Failure 1 - regex pattern not matching', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: '42',
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.VALIDATION_FAILURE);
    });
    test('Validation Failure 2 - No families found', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: 'unknown',
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.VALIDATION_FAILURE);
    });
  });

  describe('LambdaSharedRole: Lambda functions do not share roles', () => {
    const ruleId = 'LambdaSharedRole';
    test('Noncompliance 1 - L1 with primitive role value', () => {
      new CfnFunction(stack, 'rFunction1', {
        code: {},
        role: 'somerole',
      });
      new CfnFunction(stack, 'rFunction2', {
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2 - L1 with Ref role value', () => {
      const role = new CfnRole(stack, 'rRole', {
        assumeRolePolicyDocument: {},
      });
      new CfnFunction(stack, 'rFunction1', {
        code: {},
        role: role.ref,
      });
      new CfnFunction(stack, 'rFunction2', {
        code: {},
        role: role.ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3 - L2 function with L2 role', () => {
      const role = new Role(stack, 'role', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });
      new Function(stack, 'rFunction1', {
        role: role,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        runtime: getLatestRuntime('nodejs'),
      });
      new Function(stack, 'rFunction2', {
        role: role,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        runtime: getLatestRuntime('nodejs'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4 - L1 with Fn::ImportValue role value', () => {
      new CfnFunction(stack, 'rFunction1', {
        code: {},
        role: Fn.importValue('MyExternalRole'),
      });
      new CfnFunction(stack, 'rFunction2', {
        code: {},
        role: Fn.importValue('MyExternalRole'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1 - L1 with primitive role value', () => {
      new CfnFunction(stack, 'rFunction1', {
        code: {},
        role: 'somerole1',
      });
      new CfnFunction(stack, 'rFunction2', {
        code: {},
        role: 'somerole2',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 2 - L1 with Ref role value', () => {
      const role1 = new CfnRole(stack, 'rRole1', {
        assumeRolePolicyDocument: {},
      });
      new CfnFunction(stack, 'rFunction1', {
        code: {},
        role: role1.ref,
      });
      const role2 = new CfnRole(stack, 'rRole2', {
        assumeRolePolicyDocument: {},
      });
      new CfnFunction(stack, 'rFunction2', {
        code: {},
        role: role2.ref,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 3 - L2 function with L2 roles', () => {
      const role1 = new Role(stack, 'role1', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });
      new Function(stack, 'rFunction1', {
        role: role1,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        runtime: getLatestRuntime('nodejs'),
      });
      const role2 = new Role(stack, 'role2', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });
      new Function(stack, 'rFunction2', {
        role: role2,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        runtime: getLatestRuntime('nodejs'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 4 - L2 with default roles', () => {
      new Function(stack, 'rFunction1', {
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        runtime: getLatestRuntime('nodejs'),
      });
      new Function(stack, 'rFunction2', {
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        runtime: getLatestRuntime('nodejs'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 5 - L1 with Fn::ImportValue role value', () => {
      new CfnFunction(stack, 'rFunction1', {
        code: {},
        role: Fn.importValue('MyExternalRole1'),
      });
      new CfnFunction(stack, 'rFunction2', {
        code: {},
        role: Fn.importValue('MyExternalRole2'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 6 - single lambda', () => {
      new Function(stack, 'rFunction1', {
        code: Code.fromInline('hi'),
        handler: 'index.handler',
        runtime: getLatestRuntime('nodejs'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 7 - no lambdas', () => {
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

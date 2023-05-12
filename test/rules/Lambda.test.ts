/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Aspects, Stack } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import {
  CfnFunction,
  CfnPermission,
  CfnUrl,
  Code,
  DockerImageCode,
  DockerImageFunction,
  Function,
  FunctionUrlAuthType,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { TestPack, TestType, validateStack } from './utils';
import {
  LambdaConcurrency,
  LambdaDLQ,
  LambdaFunctionPublicAccessProhibited,
  LambdaFunctionUrlAuth,
  LambdaInsideVPC,
  LambdaLatestVersion,
} from '../../src/rules/lambda';

const testPack = new TestPack([
  LambdaConcurrency,
  LambdaDLQ,
  LambdaFunctionPublicAccessProhibited,
  LambdaFunctionUrlAuth,
  LambdaInsideVPC,
  LambdaLatestVersion,
]);
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
        version: match![2] ?? '0',
      };
    })
    .sort((a, b) => {
      return a.version.localeCompare(b.version, undefined, {
        numeric: true,
        sensitivity: 'case',
        caseFirst: 'upper',
      });
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

  describe('LambdaFunctionPublicAccessProhibited: Lambda function permissions do not grant public access', () => {
    const ruleId = 'LambdaFunctionPublicAccessProhibited';
    test('Noncompliance 1', () => {
      new CfnPermission(stack, 'Permission', {
        principal: '*',
        action: 'lambda:bar',
        functionName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnPermission(stack, 'OrgPermission', {
        principal: '*',
        principalOrgId: 'o-thebestorg',
        action: 'lambda:InvokeFunction',
        functionName: 'foo',
      });
      new CfnPermission(stack, 'ArnPermission', {
        principal: '*',
        sourceArn: 'arn:aws:s3:::the-best-bucket',
        action: 'lambda:InvokeFunction',
        functionName: 'foo',
      });
      new CfnPermission(stack, 'AccountPermission', {
        principal: '*',
        sourceAccount: '123456789012',
        action: 'lambda:InvokeFunction',
        functionName: 'foo',
      });
      new CfnPermission(stack, 'NoStarPermission', {
        principal: 'arn:aws:iam::111122223333:root',
        sourceAccount: '123456789012',
        action: 'lambda:InvokeFunction',
        functionName: 'foo',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('LambdaFunctionUrlAuth: Lambda function URLs have authentication', () => {
    const ruleId = 'LambdaFunctionUrlAuth';
    test('Noncompliance 1', () => {
      new CfnUrl(stack, 'rUrl', {
        authType: FunctionUrlAuthType.NONE,
        targetFunctionArn: 'somearn',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnUrl(stack, 'rUrl', {
        authType: FunctionUrlAuthType.AWS_IAM,
        targetFunctionArn: 'somearn',
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
        runtime: Runtime.NODEJS_16_X.toString(),
        code: {},
        role: 'somerole',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2 - python', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: Runtime.PYTHON_3_9.toString(),
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
        runtime: Runtime.NODEJS_16_X,
        code: Code.fromInline('hi'),
        handler: 'index.handler',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 6 - ruby', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: Runtime.RUBY_2_5.toString(),
        code: {},
        role: 'somerole',
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
    test('Compliance 9 - ruby', () => {
      new CfnFunction(stack, 'rFunction', {
        runtime: getLatestRuntime('ruby').toString(),
        code: {},
        role: 'somerole',
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
});

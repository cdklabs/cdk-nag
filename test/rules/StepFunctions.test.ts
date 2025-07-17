/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import {
  StateMachine,
  Wait,
  WaitTime,
  LogLevel,
  DefinitionBody,
} from 'aws-cdk-lib/aws-stepfunctions';
import { Aspects, Duration, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  StepFunctionStateMachineAllLogsToCloudWatch,
  StepFunctionStateMachineXray,
} from '../../src/rules/stepfunctions';

const testPack = new TestPack([
  StepFunctionStateMachineAllLogsToCloudWatch,
  StepFunctionStateMachineXray,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Step Functions', () => {
  describe('StepFunctionStateMachineErrorLogsToCloudWatch: Step Function log "ERROR" events to CloudWatch Logs', () => {
    const ruleId = 'StepFunctionStateMachineErrorLogsToCloudWatch';
    test('Noncompliance 1', () => {
      new StateMachine(stack, 'StateMachine', {
        definitionBody: DefinitionBody.fromChainable(
          new Wait(stack, 'Wait30', {
            time: WaitTime.duration(Duration.seconds(30)),
          })
        ),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new StateMachine(stack, 'StateMachine', {
        definitionBody: DefinitionBody.fromChainable(
          new Wait(stack, 'Wait30', {
            time: WaitTime.duration(Duration.seconds(30)),
          })
        ),
        logs: {
          level: LogLevel.ERROR,
          destination: new LogGroup(stack, 'SfnLog'),
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('StepFunctionStateMachineXray: Step Function have X-Ray tracing enabled', () => {
    const ruleId = 'StepFunctionStateMachineXray';
    test('Noncompliance 1', () => {
      new StateMachine(stack, 'StateMachine', {
        definitionBody: DefinitionBody.fromChainable(
          new Wait(stack, 'Wait30', {
            time: WaitTime.duration(Duration.seconds(30)),
          })
        ),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new StateMachine(stack, 'StateMachine', {
        definitionBody: DefinitionBody.fromChainable(
          new Wait(stack, 'Wait30', {
            time: WaitTime.duration(Duration.seconds(30)),
          })
        ),
        tracingEnabled: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

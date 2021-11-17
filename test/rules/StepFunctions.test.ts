/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { LogGroup } from '@aws-cdk/aws-logs';
import {
  StateMachine,
  Wait,
  WaitTime,
  LogLevel,
} from '@aws-cdk/aws-stepfunctions';
import {
  Aspects,
  CfnResource,
  Duration,
  IConstruct,
  Stack,
} from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  StepFunctionStateMachineAllLogsToCloudWatch,
  StepFunctionStateMachineXray,
} from '../../src/rules/stepfunctions';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        StepFunctionStateMachineAllLogsToCloudWatch,
        StepFunctionStateMachineXray,
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('AWS Step Functions', () => {
  test('StepFunctionStateMachineAllLogsToCloudWatch: Step Function log "ALL" events to CloudWatch Logs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new StateMachine(nonCompliant, 'rStateMachine', {
      definition: new Wait(nonCompliant, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'StepFunctionStateMachineAllLogsToCloudWatch:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new StateMachine(compliant, 'rStateMachine', {
      definition: new Wait(compliant, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
      logs: {
        level: LogLevel.ALL,
        destination: new LogGroup(compliant, 'rSfnLog'),
      },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'StepFunctionStateMachineAllLogsToCloudWatch:'
          ),
        }),
      })
    );
  });

  test('StepFunctionStateMachineXray: Step Function have X-Ray tracing enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new StateMachine(nonCompliant, 'rStateMachine', {
      definition: new Wait(nonCompliant, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('StepFunctionStateMachineXray:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new StateMachine(compliant, 'rStateMachine', {
      definition: new Wait(compliant, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
      tracingEnabled: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('StepFunctionStateMachineXray:'),
        }),
      })
    );
  });
});

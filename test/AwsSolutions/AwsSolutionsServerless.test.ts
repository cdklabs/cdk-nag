/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnGraphQLApi, GraphqlApi } from '@aws-cdk/aws-appsync';
import { LogGroup } from '@aws-cdk/aws-logs';
import {
  StateMachine,
  WaitTime,
  Wait,
  LogLevel,
} from '@aws-cdk/aws-stepfunctions';
import { Aspects, Duration, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS AppSync', () => {
  test('AwsSolutions-ASC3: GraphQL APIs have request leveling logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new AwsSolutionsChecks());
    new GraphqlApi(nonCompliant, 'rGraphqlApi', { name: 'foo' });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-ASC3:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new AwsSolutionsChecks());
    new GraphqlApi(nonCompliant2, 'rGraphqlApi', {
      name: 'foo',
      logConfig: { excludeVerboseContent: true },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-ASC3:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new AwsSolutionsChecks());
    new CfnGraphQLApi(compliant, 'rGraphqlApi', {
      authenticationType: 'AMAZON_COGNITO_USER_POOL',
      name: 'foo',
      logConfig: { cloudWatchLogsRoleArn: 'foo' },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-ASC3:'),
        }),
      })
    );
  });
});
describe('AWS Step Functions', () => {
  test('awsSolutionsSf1: Step Function log "ALL" events to CloudWatch Logs', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new StateMachine(positive, 'rStateMachine', {
      definition: new Wait(positive, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SF1:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new StateMachine(negative, 'rStateMachine', {
      definition: new Wait(negative, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
      logs: {
        level: LogLevel.ALL,
        destination: new LogGroup(negative, 'rSfnLog'),
      },
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SF1:'),
        }),
      })
    );
  });
  test('awsSolutionsSf2: Step Function have X-Ray tracing enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new StateMachine(positive, 'rStateMachine', {
      definition: new Wait(positive, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SF2:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new StateMachine(negative, 'rStateMachine', {
      definition: new Wait(negative, 'rWait30', {
        time: WaitTime.duration(Duration.seconds(30)),
      }),
      tracingEnabled: true,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-SF2:'),
        }),
      })
    );
  });
});

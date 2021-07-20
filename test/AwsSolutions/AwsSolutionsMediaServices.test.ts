/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnContainer } from '@aws-cdk/aws-mediastore';
import { Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Elemental MediaStore', () => {
  test('awsSolutionsMs1: Media Store containers have container access logging enabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new CfnContainer(positive, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS1:'),
        }),
      }),
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new CfnContainer(negative, 'rMsContainer', {
      containerName: 'foo',
      accessLoggingEnabled: true,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS1:'),
        }),
      }),
    );
  });
  test('awsSolutionsMs4: Media Store containers define metric policies to send metrics to CloudWatch', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new CfnContainer(positive, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS4:'),
        }),
      }),
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new CfnContainer(negative, 'rMsContainer', {
      containerName: 'foo',
      metricPolicy: {
        containerLevelMetrics: 'ENABLED',
      },
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS4:'),
        }),
      }),
    );
  });
  test('awsSolutionsMs7: Media Store containers define container policies', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new CfnContainer(positive, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS7:'),
        }),
      }),
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new CfnContainer(negative, 'rMsContainer', {
      containerName: 'foo',
      policy: '{"Version":"2012-10-17","Statement":...}"',
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS7:'),
        }),
      }),
    );
  });
  test('awsSolutionsMs8: Media Store containers define CORS policies', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new CfnContainer(positive, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS8:'),
        }),
      }),
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new CfnContainer(negative, 'rMsContainer', {
      containerName: 'foo',
      corsPolicy: [
        {
          allowedHeaders: ['foo'],
          allowedMethods: ['bar'],
          allowedOrigins: ['baz'],
          exposeHeaders: ['qux'],
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS8:'),
        }),
      }),
    );
  });
  test('awsSolutionsMs10: Media Store containers define lifecycle policies', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new CfnContainer(positive, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS10:'),
        }),
      }),
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new CfnContainer(negative, 'rMsContainer', {
      containerName: 'foo',
      lifecyclePolicy:
        '{"rules":[{"definition":{"path":[{"wildcard":"stream/*.ts"}],"seconds_since_create":[{"numeric":[">",300]}]},"action":"EXPIRE"}]}',
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-MS10:'),
        }),
      }),
    );
  });
});

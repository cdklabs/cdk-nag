/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnFunction } from '@aws-cdk/aws-lambda';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  LambdaConcurrency,
  LambdaDLQ,
  LambdaInsideVPC,
} from '../../src/rules/lambda';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [LambdaConcurrency, LambdaDLQ, LambdaInsideVPC];
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

describe('AWS Lambda', () => {
  test('LambdaConcurrency: Lambda functions are configured with function-level concurrent execution limits', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaConcurrency:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnFunction(nonCompliant2, 'rFunction', {
      code: {},
      role: 'somerole',
      reservedConcurrentExecutions: 0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaConcurrency:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnFunction(compliant, 'rFunction', {
      code: {},
      role: 'somerole',
      reservedConcurrentExecutions: 42,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaConcurrency:'),
        }),
      })
    );
  });

  test('LambdaDLQ: Lambda functions are configured with a dead-letter configuration', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaDLQ:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnFunction(nonCompliant2, 'rFunction', {
      code: {},
      role: 'somerole',
      deadLetterConfig: {},
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaDLQ:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnFunction(compliant, 'rFunction', {
      code: {},
      role: 'somerole',
      deadLetterConfig: { targetArn: 'mySnsTopicArn' },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaDLQ:'),
        }),
      })
    );
  });

  test('LambdaInsideVPC: Lambda functions are VPC enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaInsideVPC:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnFunction(nonCompliant2, 'rFunction', {
      code: {},
      role: 'somerole',
      vpcConfig: {
        securityGroupIds: [],
        subnetIds: [],
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaInsideVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnFunction(compliant, 'rFunction1', {
      code: {},
      role: 'somerole',
      vpcConfig: {
        securityGroupIds: ['somesecgroup'],
      },
    });
    new CfnFunction(compliant, 'rFunction2', {
      code: {},
      role: 'somerole',
      vpcConfig: {
        subnetIds: ['somesecgroup'],
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('LambdaInsideVPC:'),
        }),
      })
    );
  });
});

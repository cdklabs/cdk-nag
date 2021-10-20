/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnFunction } from '@aws-cdk/aws-lambda';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('AWS Lambda', () => {
  test('NIST.800.53.R5-LambdaConcurrency: - Lambda functions are configured with function-level concurrent execution limits - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-6)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-LambdaConcurrency:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnFunction(nonCompliant2, 'rFunction', {
      code: {},
      role: 'somerole',
      reservedConcurrentExecutions: 0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-LambdaConcurrency:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnFunction(compliant, 'rFunction', {
      code: {},
      role: 'somerole',
      reservedConcurrentExecutions: 42,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-LambdaConcurrency:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-LambdaDlq: - Lambda functions are configured with a dead-letter configuration - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-36(1)(a), SI-2a)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-LambdaDlq:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnFunction(nonCompliant2, 'rFunction', {
      code: {},
      role: 'somerole',
      deadLetterConfig: {},
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-LambdaDlq:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnFunction(compliant, 'rFunction', {
      code: {},
      role: 'somerole',
      deadLetterConfig: { targetArn: 'mySnsTopicArn' },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-LambdaDlq:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-LambdaInsideVPC: - Lambda functions are VPC enabled - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-LambdaInsideVPC:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-LambdaInsideVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-LambdaInsideVPC:'),
        }),
      })
    );
  });
});

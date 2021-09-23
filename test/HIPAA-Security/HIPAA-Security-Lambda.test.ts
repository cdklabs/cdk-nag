/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnFunction } from '@aws-cdk/aws-lambda';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('AWS Lambda', () => {
  test('hipaaSecurityLambdaConcurrency: - Lambda functions are configured with function-level concurrent execution limits - (Control ID: 164.312(b))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-LambdaConcurrency:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnFunction(nonCompliant2, 'rFunction', {
      code: {},
      role: 'somerole',
      reservedConcurrentExecutions: 0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-LambdaConcurrency:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new CfnFunction(compliant, 'rFunction', {
      code: {},
      role: 'somerole',
      reservedConcurrentExecutions: 42,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-LambdaConcurrency:'),
        }),
      })
    );
  });

  test('hipaaSecurityLambdaDlq: - Lambda functions are configured with a dead-letter configuration - (Control ID: 164.312(b))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-LambdaDlq:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnFunction(nonCompliant2, 'rFunction', {
      code: {},
      role: 'somerole',
      deadLetterConfig: {},
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-LambdaDlq:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new CfnFunction(compliant, 'rFunction', {
      code: {},
      role: 'somerole',
      deadLetterConfig: { targetArn: 'mySnsTopicArn' },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-LambdaDlq:'),
        }),
      })
    );
  });

  test('hipaaSecurityLambdaInsideVPC: - Lambda functions are VPC enabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-LambdaInsideVPC:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-LambdaInsideVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-LambdaInsideVPC:'),
        }),
      })
    );
  });
});

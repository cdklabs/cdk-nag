/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnFunction } from '@aws-cdk/aws-lambda';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('AWS Lambda', () => {
  test('PCI.DSS.321-LambdaInsideVPC: - Lambda functions are VPC enabled - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnFunction(nonCompliant, 'rFunction', {
      code: {},
      role: 'somerole',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-LambdaInsideVPC:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-LambdaInsideVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-LambdaInsideVPC:'),
        }),
      })
    );
  });
});

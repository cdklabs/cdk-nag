/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnFunction } from '@aws-cdk/aws-lambda';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon Lambda', () => {
    //Test whether Lambda functions exist within VPCs
    test('nist80053LambdaFunctionsInsideVPC: - Lambda functions are contained within a VPC - (Control IDs: AC-4, SC-7, SC-7(3))', () => {
      //Expect a POSITIVE response because no VPC is defined for the lambda function
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnFunction(positive, 'newfunction', {
        code: {},
        role: 'somerole',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-LambdaFunctionsInsideVPC:'
            ),
          }),
        })
      );

      //Expect a POSITIVE response because an empty VpcConfig is specified
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnFunction(positive2, 'newfunction', {
        code: {},
        role: 'somerole',
        vpcConfig: {
          securityGroupIds: [],
          subnetIds: [],
        },
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-LambdaFunctionsInsideVPC:'
            ),
          }),
        })
      );

      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because the lambda function has a VPC security group defined
      new CfnFunction(negative, 'newfunc1', {
        code: {},
        role: 'somerole',
        vpcConfig: {
          securityGroupIds: ['somesecgroup'],
        },
      });

      //Expect a NEGATIVE response because the lambda function has a VPC subnet defined
      new CfnFunction(negative, 'newfunc2', {
        code: {},
        role: 'somerole',
        vpcConfig: {
          subnetIds: ['somesecgroup'],
        },
      });

      //Check cdk-nag response
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-LambdaFunctionsInsideVPC:'
            ),
          }),
        })
      );
    });
  });
});

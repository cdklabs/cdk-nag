/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnEnvironmentEC2 } from 'aws-cdk-lib/aws-cloud9';
import { InstanceType, InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, validateStack, TestType } from './utils';
import { Cloud9InstanceNoIngressSystemsManager } from '../../src/rules/cloud9';

const testPack = new TestPack([Cloud9InstanceNoIngressSystemsManager]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Cloud9', () => {
  describe('Cloud9InstanceNoIngressSystemsManager: Cloud9 instances use no-ingress EC2 instances with AWS Systems Manager', () => {
    const ruleId = 'Cloud9InstanceNoIngressSystemsManager';
    test('Noncompliance ', () => {
      new CfnEnvironmentEC2(stack, 'rC9Env', {
        imageId: 'ami-123456',
        instanceType: InstanceType.of(
          InstanceClass.T2,
          InstanceSize.MICRO
        ).toString(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnEnvironmentEC2(stack, 'rC9Env', {
        imageId: 'ami-123456',
        instanceType: InstanceType.of(
          InstanceClass.T2,
          InstanceSize.MICRO
        ).toString(),
        connectionType: 'CONNECT_SSM',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

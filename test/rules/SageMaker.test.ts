/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { CfnEndpointConfig, CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  SageMakerEndpointConfigurationKMSKeyConfigured,
  SageMakerNotebookInVPC,
  SageMakerNotebookInstanceKMSKeyConfigured,
  SageMakerNotebookNoDirectInternetAccess,
} from '../../src/rules/sagemaker';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  SageMakerEndpointConfigurationKMSKeyConfigured,
  SageMakerNotebookInVPC,
  SageMakerNotebookInstanceKMSKeyConfigured,
  SageMakerNotebookNoDirectInternetAccess,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon SageMaker', () => {
  describe('SageMakerEndpointConfigurationKMSKeyConfigured: SageMaker endpoints utilize a KMS key', () => {
    const ruleId = 'SageMakerEndpointConfigurationKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnEndpointConfig(stack, 'badendpoint', {
        productionVariants: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEndpointConfig(stack, 'badendpoint', {
        productionVariants: [],
        kmsKeyId: 'somecoolIDkey',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerNotebookInVPC: SageMaker notebook instances are provisioned inside a VPC', () => {
    const ruleId = 'SageMakerNotebookInVPC';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        subnetId: 'subnet-0bb1c79de3EXAMPLE',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerNotebookInstanceKMSKeyConfigured: SageMaker notebook instances utilize KMS keys for encryption at rest', () => {
    const ruleId = 'SageMakerNotebookInstanceKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        kmsKeyId: '1234abcd-12ab-34cd-56ef-1234567890ab',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerNotebookNoDirectInternetAccess: SageMaker notebook instances have direct internet access disabled', () => {
    const ruleId = 'SageMakerNotebookNoDirectInternetAccess';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        subnetId: 'subnet-0bb1c79de3EXAMPLE',
        directInternetAccess: 'Disabled',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

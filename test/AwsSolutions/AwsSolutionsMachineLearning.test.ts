/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Solutions Machine Learning Checks', () => {
  describe('Amazon SageMaker', () => {
    test('awsSolutionsSm1: SageMaker notebook instances are provisioned inside a VPC', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnNotebookInstance(positive, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(positive, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-SM1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnNotebookInstance(negative, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(negative, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        subnetId: 'subnet-0bb1c79de3EXAMPLE',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-SM1:'),
          }),
        })
      );
    });
    test('awsSolutionsSm2: SageMaker notebook instances use encrypted storage volumes', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnNotebookInstance(positive, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(positive, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-SM2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnNotebookInstance(negative, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(negative, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        kmsKeyId: '1234abcd-12ab-34cd-56ef-1234567890ab',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-SM2:'),
          }),
        })
      );
    });
    test('awsSolutionsSm3: SageMaker notebook instances have direct internet access disabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnNotebookInstance(positive, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(positive, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-SM3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnNotebookInstance(negative, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(negative, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        subnetId: 'subnet-0bb1c79de3EXAMPLE',
        directInternetAccess: 'Disabled',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-SM3:'),
          }),
        })
      );
    });
  });
});

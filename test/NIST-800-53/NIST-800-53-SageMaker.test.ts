/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { CfnEndpointConfig, CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon SageMaker', () => {
    //Test whether SageMaker endpoints are encrypted with a KMS key
    test('NIST.800.53-SageMakerEndpointKMS: SageMaker endpoints use a KMS key for encryption - (Control IDs: SC-13, SC-28)', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnEndpointConfig(positive, 'badendpoint', {
        productionVariants: [],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-SageMakerEndpointKMS:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new CfnEndpointConfig(negative, 'badendpoint', {
        productionVariants: [],
        kmsKeyId: 'somecoolIDkey',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-SageMakerEndpointKMS:'),
          }),
        })
      );
    });

    //Test whether SageMaker notebooks are encrypted with a KMS key
    //These tests taken from AWS Solutions tests for rule "SM2"
    test('NIST.800.53-SageMakerNotebookKMS: SageMaker notebooks use a KMS key for encryption - (Control IDs: SC-13, SC-28)', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
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
            data: expect.stringContaining('NIST.800.53-SageMakerNotebookKMS:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
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
            data: expect.stringContaining('NIST.800.53-SageMakerNotebookKMS:'),
          }),
        })
      );
    });

    //Test whether SageMaker notebooks disable direct internet access
    //These tests taken from AWS Solutions tests for rule "SM3"
    test('nist80053SageMakerDirectInternetAccessDisabled: - SageMaker instances disabled direct internet access - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3))', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
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
            data: expect.stringContaining(
              'NIST.800.53-SageMakerDirectInternetAccessDisbabled:'
            ),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
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
            data: expect.stringContaining(
              'NIST.800.53-SageMakerDirectInternetAccessDisbabled:'
            ),
          }),
        })
      );
    });
  });
});

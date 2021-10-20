/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { CfnEndpointConfig, CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon SageMaker', () => {
  test('NIST.800.53.R5-SageMakerEndpointConfigurationKMSKeyConfigured: - SageMaker endpoints utilize a KMS key - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnEndpointConfig(nonCompliant, 'badendpoint', {
      productionVariants: [],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SageMakerEndpointConfigurationKMSKeyConfigured:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnEndpointConfig(compliant, 'badendpoint', {
      productionVariants: [],
      kmsKeyId: 'somecoolIDkey',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SageMakerEndpointConfigurationKMSKeyConfigured:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-SageMakerNotebookInstanceKMSKeyConfigured: - SageMaker notebook instances utilize KMS keys for encryption at rest - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnNotebookInstance(nonCompliant, 'rNotebook', {
      instanceType: 'ml.t3.xlarge',
      roleArn: new Role(nonCompliant, 'rNotebookRole', {
        assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
      }).roleArn,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SageMakerNotebookInstanceKMSKeyConfigured:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnNotebookInstance(compliant, 'rNotebook', {
      instanceType: 'ml.t3.xlarge',
      roleArn: new Role(compliant, 'rNotebookRole', {
        assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
      }).roleArn,
      kmsKeyId: '1234abcd-12ab-34cd-56ef-1234567890ab',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SageMakerNotebookInstanceKMSKeyConfigured:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-SageMakerNotebookNoDirectInternetAccess: - SageMaker notebook instances have direct internet access disabled - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnNotebookInstance(nonCompliant, 'rNotebook', {
      instanceType: 'ml.t3.xlarge',
      roleArn: new Role(nonCompliant, 'rNotebookRole', {
        assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
      }).roleArn,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SageMakerNotebookNoDirectInternetAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnNotebookInstance(compliant, 'rNotebook', {
      instanceType: 'ml.t3.xlarge',
      roleArn: new Role(compliant, 'rNotebookRole', {
        assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
      }).roleArn,
      subnetId: 'subnet-0bb1c79de3EXAMPLE',
      directInternetAccess: 'Disabled',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-SageMakerNotebookNoDirectInternetAccess:'
          ),
        }),
      })
    );
  });
});

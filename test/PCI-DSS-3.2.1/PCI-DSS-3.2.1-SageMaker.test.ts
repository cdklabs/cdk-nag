/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { CfnEndpointConfig, CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon SageMaker', () => {
  test('PCI.DSS.321-SageMakerEndpointConfigurationKMSKeyConfigured: - SageMaker endpoints utilize a KMS key - (Control IDs: 3.4, 8.2.1, 10.5)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnEndpointConfig(nonCompliant, 'badendpoint', {
      productionVariants: [],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-SageMakerEndpointConfigurationKMSKeyConfigured:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new CfnEndpointConfig(compliant, 'badendpoint', {
      productionVariants: [],
      kmsKeyId: 'somecoolIDkey',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-SageMakerEndpointConfigurationKMSKeyConfigured:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-SageMakerNotebookInstanceKMSKeyConfigured: - SageMaker notebook instances utilize KMS keys for encryption at rest - (Control IDs: 3.4, 8.2.1, 10.5)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-SageMakerNotebookInstanceKMSKeyConfigured:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-SageMakerNotebookInstanceKMSKeyConfigured:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-SageMakerNotebookNoDirectInternetAccess: - SageMaker notebook instances have direct internet access disabled - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-SageMakerNotebookNoDirectInternetAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-SageMakerNotebookNoDirectInternetAccess:'
          ),
        }),
      })
    );
  });
});

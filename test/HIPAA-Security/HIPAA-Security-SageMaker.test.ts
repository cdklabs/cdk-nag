/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { CfnEndpointConfig, CfnNotebookInstance } from '@aws-cdk/aws-sagemaker';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('Amazon SageMaker', () => {
  test('HIPAA.Security-SageMakerEndpointConfigurationKMSKeyConfigured: - SageMaker endpoints utilize a KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnEndpointConfig(nonCompliant, 'badendpoint', {
      productionVariants: [],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-SageMakerEndpointConfigurationKMSKeyConfigured:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new CfnEndpointConfig(compliant, 'badendpoint', {
      productionVariants: [],
      kmsKeyId: 'somecoolIDkey',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-SageMakerEndpointConfigurationKMSKeyConfigured:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-SageMakerNotebookInstanceKMSKeyConfigured: - SageMaker notebook instances utilize KMS keys for encryption at rest - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-SageMakerNotebookInstanceKMSKeyConfigured:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-SageMakerNotebookInstanceKMSKeyConfigured:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-SageMakerNotebookNoDirectInternetAccess: - SageMaker notebook instances have direct internet access disabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-SageMakerNotebookNoDirectInternetAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-SageMakerNotebookNoDirectInternetAccess:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnCluster } from '@aws-cdk/aws-emr';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon EMR', () => {
  test('PCI.DSS.321-EMRKerberosEnabled: - EMR clusters have Kerberos enabled - (Control ID: 7.2.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnCluster(nonCompliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-EMRKerberosEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new CfnCluster(compliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      kerberosAttributes: {
        kdcAdminPassword: 'baz',
        realm: 'qux',
      },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-EMRKerberosEnabled:'),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnLoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';


describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon ELB', () => {

    //Test whether Lambda functions exist within VPCs
    test('nist80053ELBUseACMCerts: - ELBs use ACM certificates - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13)', () => {

      //Expect a POSITIVE response because the ELB listener does not use an ACM certificate
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnLoadBalancer(positive, 'newelb', {
        listeners: [
          {
            instancePort: '1',
            loadBalancerPort: '1',
            protocol: 'ssl',
            sslCertificateId: 'myrandomsslcertarn',
          },
        ],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ELBUseACMCerts:'),
          }),
        }),
      );

      //Expect a POSITIVE response because there is no certificate ARN given
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnLoadBalancer(positive2, 'newelb', {
        listeners: [
          {
            instancePort: '1',
            loadBalancerPort: '1',
            protocol: 'ssl',
          },
        ],
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ELBUseACMCerts:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because there are no listeners in the ELB
      new CfnLoadBalancer(negative, 'newelb', {
        listeners: [
        ],
      });

      //Expect a NEGATIVE response because the certificate ARN is a valid ACM resource
      new CfnLoadBalancer(negative, 'newelb2', {
        listeners: [
          {
            instancePort: '1',
            loadBalancerPort: '1',
            protocol: 'ssl',
            sslCertificateId: 'arn:aws:acm:someacmcertid',
          },
        ],
      });

      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ELBUseACMCerts:'),
          }),
        }),
      );
    });


  });
});

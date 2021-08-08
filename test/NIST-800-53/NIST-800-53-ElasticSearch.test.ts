/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';


describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon ElasticSearch', () => {

    //Test whether ElasticSearch domains are running within a VPC
    test('nist80053ElasticSearchRunningWithinVPC: - ElasticSearch domains are running within a VPC - (Control IDs: AC-4, SC-7, SC-7(3))', () => {


      //Expect a POSITIVE response because vpc options aren't defined
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnDomain(positive, 'newdomain', {
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ElasticSearchRunningWithinVPC:'),
          }),
        }),
      );

      //Expect a POSITIVE response because no subnet IDs are set
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnDomain(positive2, 'newdomain', {
        vpcOptions: {
          subnetIds: [],
        },
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ElasticSearchRunningWithinVPC:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());


      //Expect a NEGATIVE response because a subnet ID is given within VPC options
      new CfnDomain(negative, 'newdomain', {
        vpcOptions: {
          subnetIds: ['mycoolsubnet'],
        },
      });


      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ElasticSearchRunningWithinVPC:'),
          }),
        }),
      );
    });


    //Test whether ElasticSearch domains are encrypted at rest
    test('nist80053ElasticSearchEncryptedAtRest: - ElasticSearch domains are encrypted at rest - (Control IDs: SC-13, SC-28)', () => {


      //Expect a POSITIVE response because encryption at rest is not defined
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnDomain(positive, 'newdomain', {
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ElasticSearchEncryptedAtRest:'),
          }),
        }),
      );

      //Expect a POSITIVE response because encryption at rest is not enabled
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnDomain(positive2, 'newdomain', {
        encryptionAtRestOptions: {
          enabled: false,
        },
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ElasticSearchEncryptedAtRest:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());


      //Expect a NEGATIVE response because encryption at rest is enabled
      new CfnDomain(negative, 'newdomain', {
        encryptionAtRestOptions: {
          enabled: true,
        },
      });


      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ElasticSearchEncryptedAtRest:'),
          }),
        }),
      );
    });


  });
});

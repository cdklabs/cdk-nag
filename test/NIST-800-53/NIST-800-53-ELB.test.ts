/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { LoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 Elastic Load Balancer Compliance Checks', () => {
  describe('Amazon ELB', () => {
    test('NIST.800.53-ALBHttpDropInvalidHeaderEnabled: Load balancers have invalid http header dropping enabled', () => {

      const nonCompliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      const alb1 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
        vpc: new Vpc(nonCompliant, 'rVPC'),
      });
      alb1.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ALBHttpDropInvalidHeaderEnabled:'),
          }),
        }),
      );

      const compliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant).add(new NIST80053Checks());
      const alb = new ApplicationLoadBalancer(compliant, 'rALB', {
        vpc: new Vpc(compliant, 'rVPC'),
      });

      alb.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
      alb.setAttribute('routing.http.drop_invalid_header_fields.enabled', 'true');
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ALBHttpDropInvalidHeaderEnabled:'),
          }),
        }),
      );

    });

    test('NIST.800.53-nist80053ALBLoggingEnabled: Load balancers have logging enabled', () => {

      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      const alb2 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
        vpc: new Vpc(nonCompliant, 'rVPC'),
      });
      alb2.setAttribute('routing.http.drop_invalid_header_fields.enabled', 'true');

      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-nist80053ALBLoggingEnabled:'),
          }),
        }),
      );
      const compliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant).add(new NIST80053Checks());
      const alb = new ApplicationLoadBalancer(compliant, 'rALB', {
        vpc: new Vpc(compliant, 'rVPC'),
      });
      alb.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-nist80053ALBLoggingEnabled:'),
          }),
        }),
      );
    });

    test('NIST.800.53-nist80053ELBLoggingEnabled: Load balancers have logging enabled', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      new LoadBalancer(nonCompliant, 'rELB', {
        vpc: new Vpc(nonCompliant, 'rVPC'),
        accessLoggingPolicy: {
          s3BucketName: 'foo',
          enabled: false,
        },
      });
      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-nist80053ELBLoggingEnabled:'),
          }),
        }),
      );
      const compliant = new Stack();
      Aspects.of(compliant).add(new NIST80053Checks());
      new LoadBalancer(compliant, 'rELB', {
        vpc: new Vpc(compliant, 'rVPC'),
        accessLoggingPolicy: {
          s3BucketName: 'foo',
          enabled: true,
        },
      });
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-nist80053ELBLoggingEnabled:'),
          }),
        }),
      );

    });


  });
});



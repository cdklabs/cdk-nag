/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { LoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import {
  ApplicationLoadBalancer,
  ApplicationListener,
  ListenerAction,
  ApplicationProtocol,
} from '@aws-cdk/aws-elasticloadbalancingv2';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 Elastic Load Balancer Compliance Checks', () => {
  describe('Elastic Load Balancing', () => {
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
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpDropInvalidHeaderEnabled:'
            ),
          }),
        })
      );

      const compliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant).add(new NIST80053Checks());
      const alb = new ApplicationLoadBalancer(compliant, 'rALB', {
        vpc: new Vpc(compliant, 'rVPC'),
      });

      alb.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
      alb.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpDropInvalidHeaderEnabled:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-ALBHttpToHttpsRedirection: Http ALB listeners are configured to redirect to https', () => {
      //test for non-compliant application listener
      const nonCompliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(nonCompliant).add(new NIST80053Checks());

      const myBalancer = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
        vpc: new Vpc(nonCompliant, 'rVPC'),
      });

      myBalancer.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
      myBalancer.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );

      new ApplicationListener(nonCompliant, 'rALBListener', {
        loadBalancer: myBalancer,
        protocol: ApplicationProtocol.HTTP,
        defaultAction: ListenerAction.fixedResponse(200, {
          contentType: 'string',
          messageBody: 'OK',
        }),
      });

      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpToHttpsRedirection:'
            ),
          }),
        })
      );

      //test for application listener configured correctly
      const compliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant).add(new NIST80053Checks());

      const myBalancer2 = new ApplicationLoadBalancer(compliant, 'rELB', {
        vpc: new Vpc(compliant, 'rVPC'),
      });

      myBalancer2.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
      myBalancer2.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );

      new ApplicationListener(compliant, 'rALBListener', {
        loadBalancer: myBalancer2,
        protocol: ApplicationProtocol.HTTP,
        defaultAction: ListenerAction.redirect({
          protocol: ApplicationProtocol.HTTPS,
        }),
      });

      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpToHttpsRedirection:'
            ),
          }),
        })
      );

      //test for no listeners or load balancers
      const compliant2 = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant2).add(new NIST80053Checks());

      new Vpc(compliant2, 'rVPC');

      const messages3 = SynthUtils.synthesize(compliant2).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpToHttpsRedirection:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-nist80053ALBLoggingEnabled: Application load balancers have logging enabled', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      const alb2 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
        vpc: new Vpc(nonCompliant, 'rVPC'),
      });
      alb2.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );

      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-nist80053ALBLoggingEnabled:'
            ),
          }),
        })
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
            data: expect.stringContaining(
              'NIST.800.53-nist80053ALBLoggingEnabled:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-nist80053ELBLoggingEnabled: Elastic Load balancers have logging enabled', () => {
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
            data: expect.stringContaining(
              'NIST.800.53-nist80053ELBLoggingEnabled:'
            ),
          }),
        })
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
            data: expect.stringContaining(
              'NIST.800.53-nist80053ELBLoggingEnabled:'
            ),
          }),
        })
      );
    });
  });
});

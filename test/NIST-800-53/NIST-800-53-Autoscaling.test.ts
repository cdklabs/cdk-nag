/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnAutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';


describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon Autoscaling', () => {

    //Test whether Autoscaling groups associated with a load balancer utilize ELB health checks
    test('nist80053AutoscalingHealthChecks: - Autoscaling groups associated with load balancers utilize ELB health checks - (Control IDs: SC-5)', () => {

      //Expect a POSITIVE response because a classic LB is defined and health checks are not specified
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnAutoScalingGroup(positive, 'newautoscalinggroup', {
        maxSize: '10',
        minSize: '1',
        loadBalancerNames: ['mycoolloadbalancer'],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-AutoscalingHealthChecks:'),
          }),
        }),
      );

      //Expect a POSITIVE response because multiple load balancer target groups are specified and healthchecks are not specified
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnAutoScalingGroup(positive2, 'newautoscalinggroup', {
        maxSize: '10',
        minSize: '1',
        targetGroupArns: ['mycooltargetgroup1', 'mycooltargetgroup2'],
        healthCheckType: 'EC2',
      });
      const messages2 = SynthUtils.synthesize(positive).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-AutoscalingHealthChecks:'),
          }),
        }),
      );


      //Expect a POSITIVE response because a classic LB is defined and health checks are set to "EC2"
      const positive3 = new Stack();
      Aspects.of(positive3).add(new NIST80053Checks());
      new CfnAutoScalingGroup(positive3, 'newautoscalinggroup', {
        maxSize: '10',
        minSize: '1',
        loadBalancerNames: ['mycoolloadbalancer'],
        healthCheckType: 'EC2',
      });
      const messages3 = SynthUtils.synthesize(positive).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-AutoscalingHealthChecks:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because the autoscaling group is not associated with any load balancers
      new CfnAutoScalingGroup(negative, 'newautoscalinggroup', {
        maxSize: '10',
        minSize: '1',
      });

      //Expect a NEGATIVE response because the autoscaling group is associated with a classic ELB and specifies ELB healthchecks
      new CfnAutoScalingGroup(negative, 'newautoscalinggroup2', {
        maxSize: '10',
        minSize: '1',
        loadBalancerNames: ['mycoolloadbalancer'],
        healthCheckType: 'ELB',
      });

      //Expect a NEGATIVE response because the autoscaling group is associated with multiple target groups and specifies ELB healthchecks
      new CfnAutoScalingGroup(negative, 'newautoscalinggroup3', {
        maxSize: '10',
        minSize: '1',
        targetGroupArns: ['mycoolloadbalancerarn', 'myawesomeloadbalancerarn'],
        healthCheckType: 'ELB',
      });

      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-AutoscalingHealthChecks:'),
          }),
        }),
      );
    });


  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import {
  CfnAutoScalingGroup,
  CfnLaunchConfiguration,
} from '@aws-cdk/aws-autoscaling';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('Amazon AutoScaling', () => {
  test('hipaaSecurityAutoscalingGroupELBHealthCheckRequired: - AutoScaling groups associated with load balancers utilize ELB health checks - (Control ID: 164.312(b))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnAutoScalingGroup(nonCompliant, 'rASG', {
      maxSize: '10',
      minSize: '1',
      loadBalancerNames: ['mycoolloadbalancer'],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnAutoScalingGroup(nonCompliant2, 'rASG', {
      maxSize: '10',
      minSize: '1',
      targetGroupArns: ['mycooltargetgroup1', 'mycooltargetgroup2'],
      healthCheckType: 'EC2',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
    new CfnAutoScalingGroup(nonCompliant3, 'rASG', {
      maxSize: '10',
      minSize: '1',
      loadBalancerNames: ['mycoolloadbalancer'],
      healthCheckType: 'EC2',
    });
    const messages3 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new CfnAutoScalingGroup(compliant, 'rASG', {
      maxSize: '10',
      minSize: '1',
    });
    new CfnAutoScalingGroup(compliant, 'rASG2', {
      maxSize: '10',
      minSize: '1',
      loadBalancerNames: ['mycoolloadbalancer'],
      healthCheckType: 'ELB',
    });
    new CfnAutoScalingGroup(compliant, 'rASG3', {
      maxSize: '10',
      minSize: '1',
      targetGroupArns: ['mycoolloadbalancerarn', 'myawesomeloadbalancerarn'],
      healthCheckType: 'ELB',
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );
  });
  test('hipaaSecurityAutoscalingLaunchConfigPublicIpDisabled: - Auto Scaling launch configurations have public IP addresses disabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnLaunchConfiguration(nonCompliant, 'rLaunchConfig', {
      imageId: 'mycoolimageid',
      instanceType: 'mycoolinstancetype',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-AutoscalingLaunchConfigPublicIpDisabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new CfnLaunchConfiguration(compliant, 'rLaunchConfig', {
      imageId: 'mycoolimageid',
      instanceType: 'mycoolinstancetype',
      associatePublicIpAddress: false,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-AutoscalingLaunchConfigPublicIpDisabled:'
          ),
        }),
      })
    );
  });
});

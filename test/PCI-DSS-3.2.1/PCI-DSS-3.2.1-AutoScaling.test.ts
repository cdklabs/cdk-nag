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
import { PCIDSS321Checks } from '../../src';

describe('Amazon AutoScaling', () => {
  test('PCI.DSS.321-AutoscalingGroupELBHealthCheckRequired: - AutoScaling groups associated with load balancers utilize ELB health checks  - (Control ID: 2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-AutoscalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );
  });
  test('PCI.DSS.321-AutoscalingLaunchConfigPublicIpDisabled: - Auto Scaling launch configurations have public IP addresses disabled  - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnLaunchConfiguration(nonCompliant, 'rLaunchConfig', {
      imageId: 'mycoolimageid',
      instanceType: 'mycoolinstancetype',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-AutoscalingLaunchConfigPublicIpDisabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-AutoscalingLaunchConfigPublicIpDisabled:'
          ),
        }),
      })
    );
  });
});

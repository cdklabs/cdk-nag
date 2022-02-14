/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  AutoScalingGroup,
  CfnAutoScalingGroup,
  CfnLaunchConfiguration,
  HealthCheck,
  ScalingEvent,
  ScalingEvents,
} from 'aws-cdk-lib/aws-autoscaling';
import {
  InstanceClass,
  InstanceType,
  MachineImage,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Aspects, Duration, Stack } from 'aws-cdk-lib/core';
import {
  AutoScalingGroupHealthCheck,
  AutoScalingGroupCooldownPeriod,
  AutoScalingGroupELBHealthCheckRequired,
  AutoScalingGroupScalingNotifications,
  AutoScalingLaunchConfigPublicIpDisabled,
} from '../../src/rules/autoscaling';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  AutoScalingGroupHealthCheck,
  AutoScalingGroupCooldownPeriod,
  AutoScalingGroupELBHealthCheckRequired,
  AutoScalingGroupScalingNotifications,
  AutoScalingLaunchConfigPublicIpDisabled,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon EC2 Auto Scaling', () => {
  describe('AutoScalingGroupHealthCheck: Auto Scaling Groups have properly configured health checks', () => {
    const ruleId = 'AutoScalingGroupHealthCheck';
    test('Noncompliance 1', () => {
      new CfnAutoScalingGroup(stack, 'rAsg', {
        minSize: '7',
        maxSize: '42',
        healthCheckType: 'ELB',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        healthCheck: HealthCheck.elb({ grace: Duration.seconds(42) }),
      });
      new AutoScalingGroup(stack, 'rAsg2', {
        vpc: new Vpc(stack, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('AutoScalingGroupCooldownPeriod: Auto Scaling Groups have configured cooldown periods', () => {
    const ruleId = 'AutoScalingGroupCooldownPeriod';
    test('Noncompliance 1', () => {
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        cooldown: Duration.seconds(0),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        cooldown: Duration.seconds(42),
      });
      new AutoScalingGroup(stack, 'rAsg2', {
        vpc: new Vpc(stack, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('AutoScalingGroupELBHealthCheckRequired: AutoScaling groups associated with load balancers utilize ELB health checks', () => {
    const ruleId = 'AutoScalingGroupELBHealthCheckRequired';

    test('Noncompliance 1', () => {
      new CfnAutoScalingGroup(stack, 'rASG', {
        maxSize: '10',
        minSize: '1',
        loadBalancerNames: ['mycoolloadbalancer'],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnAutoScalingGroup(stack, 'rASG', {
        maxSize: '10',
        minSize: '1',
        targetGroupArns: ['mycooltargetgroup1', 'mycooltargetgroup2'],
        healthCheckType: 'EC2',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnAutoScalingGroup(stack, 'rASG', {
        maxSize: '10',
        minSize: '1',
        loadBalancerNames: ['mycoolloadbalancer'],
        healthCheckType: 'EC2',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnAutoScalingGroup(stack, 'rASG', {
        maxSize: '10',
        minSize: '1',
      });
      new CfnAutoScalingGroup(stack, 'rASG2', {
        maxSize: '10',
        minSize: '1',
        loadBalancerNames: ['mycoolloadbalancer'],
        healthCheckType: 'ELB',
      });
      new CfnAutoScalingGroup(stack, 'rASG3', {
        maxSize: '10',
        minSize: '1',
        targetGroupArns: ['mycoolloadbalancerarn', 'myawesomeloadbalancerarn'],
        healthCheckType: 'ELB',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('AutoScalingGroupScalingNotifications: Auto Scaling Groups have notifications for all scaling events configured', () => {
    const ruleId = 'AutoScalingGroupScalingNotifications';
    test('Noncompliance 1', () => {
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        notifications: [
          {
            scalingEvents: ScalingEvents.ERRORS,
            topic: new Topic(stack, 'rAsgTopic'),
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      const negTopic = new Topic(stack, 'rAsgTopic');
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        notifications: [
          {
            scalingEvents: {
              _types: [
                ScalingEvent.INSTANCE_TERMINATE,
                ScalingEvent.INSTANCE_TERMINATE_ERROR,
              ],
            },
            topic: negTopic,
          },
          {
            scalingEvents: ScalingEvents.LAUNCH_EVENTS,
            topic: negTopic,
          },
        ],
      });
      new AutoScalingGroup(stack, 'rAsg2', {
        vpc: new Vpc(stack, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        notifications: [
          {
            scalingEvents: ScalingEvents.ALL,
            topic: negTopic,
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('AutoScalingLaunchConfigPublicIpDisabled: Auto Scaling launch configurations have public IP addresses disabled', () => {
    const ruleId = 'AutoScalingLaunchConfigPublicIpDisabled';
    test('Noncompliance ', () => {
      new CfnLaunchConfiguration(stack, 'rLaunchConfig', {
        imageId: 'mycoolimageid',
        instanceType: 'mycoolinstancetype',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnLaunchConfiguration(stack, 'rLaunchConfig', {
        imageId: 'mycoolimageid',
        instanceType: 'mycoolinstancetype',
        associatePublicIpAddress: false,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

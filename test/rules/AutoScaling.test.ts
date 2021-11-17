/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  AutoScalingGroup,
  CfnAutoScalingGroup,
  CfnLaunchConfiguration,
  HealthCheck,
  ScalingEvent,
  ScalingEvents,
} from '@aws-cdk/aws-autoscaling';
import {
  InstanceClass,
  InstanceType,
  MachineImage,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { Topic } from '@aws-cdk/aws-sns';
import {
  Aspects,
  CfnResource,
  Duration,
  IConstruct,
  Stack,
} from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  AutoScalingGroupHealthCheck,
  AutoScalingGroupCooldownPeriod,
  AutoScalingGroupELBHealthCheckRequired,
  AutoScalingGroupScalingNotifications,
  AutoScalingLaunchConfigPublicIpDisabled,
} from '../../src/rules/autoscaling';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        AutoScalingGroupHealthCheck,
        AutoScalingGroupCooldownPeriod,
        AutoScalingGroupELBHealthCheckRequired,
        AutoScalingGroupScalingNotifications,
        AutoScalingLaunchConfigPublicIpDisabled,
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('Amazon EC2 Auto Scaling', () => {
  test('AutoScalingGroupHealthCheck: Auto Scaling Groups have properly configured health checks', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnAutoScalingGroup(nonCompliant, 'rAsg', {
      minSize: '7',
      maxSize: '42',
      healthCheckType: 'ELB',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AutoScalingGroupHealthCheck:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new AutoScalingGroup(compliant, 'rAsg', {
      vpc: new Vpc(compliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
      healthCheck: HealthCheck.elb({ grace: Duration.seconds(42) }),
    });
    new AutoScalingGroup(compliant, 'rAsg2', {
      vpc: new Vpc(compliant, 'rVpc2'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AutoScalingGroupHealthCheck:'),
        }),
      })
    );
  });

  test('AutoScalingGroupCooldownPeriod: Auto Scaling Groups have configured cooldown periods', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new AutoScalingGroup(nonCompliant, 'rAsg', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
      cooldown: Duration.seconds(0),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AutoScalingGroupCooldownPeriod:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new AutoScalingGroup(compliant, 'rAsg', {
      vpc: new Vpc(compliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
      cooldown: Duration.seconds(42),
    });
    new AutoScalingGroup(compliant, 'rAsg2', {
      vpc: new Vpc(compliant, 'rVpc2'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AutoScalingGroupCooldownPeriod:'),
        }),
      })
    );
  });

  test('AutoScalingGroupELBHealthCheckRequired: AutoScaling groups associated with load balancers utilize ELB health checks', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
            'AutoScalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
            'AutoScalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
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
            'AutoScalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
            'AutoScalingGroupELBHealthCheckRequired:'
          ),
        }),
      })
    );
  });

  test('AutoScalingGroupScalingNotifications: Auto Scaling Groups have notifications for all scaling events configured', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new AutoScalingGroup(nonCompliant, 'rAsg', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
      notifications: [
        {
          scalingEvents: ScalingEvents.ERRORS,
          topic: new Topic(nonCompliant, 'rAsgTopic'),
        },
      ],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AutoScalingGroupScalingNotifications:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new AutoScalingGroup(nonCompliant2, 'rAsg', {
      vpc: new Vpc(nonCompliant2, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AutoScalingGroupScalingNotifications:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const negTopic = new Topic(compliant, 'rAsgTopic');
    new AutoScalingGroup(compliant, 'rAsg', {
      vpc: new Vpc(compliant, 'rVpc'),
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
    new AutoScalingGroup(compliant, 'rAsg2', {
      vpc: new Vpc(compliant, 'rVpc2'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
      notifications: [
        {
          scalingEvents: ScalingEvents.ALL,
          topic: negTopic,
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AutoScalingGroupScalingNotifications:'
          ),
        }),
      })
    );
  });

  test('AutoScalingLaunchConfigPublicIpDisabled: Auto Scaling launch configurations have public IP addresses disabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnLaunchConfiguration(nonCompliant, 'rLaunchConfig', {
      imageId: 'mycoolimageid',
      instanceType: 'mycoolinstancetype',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AutoScalingLaunchConfigPublicIpDisabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
            'AutoScalingLaunchConfigPublicIpDisabled:'
          ),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  AutoScalingGroup,
  CfnAutoScalingGroup,
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
import { Aspects, Duration, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Solutions Management and Governance Checks', () => {
  describe('Amazon EC2 Auto Scaling', () => {
    test('awsSolutionsAs1: Auto Scaling Groups have configured cooldown periods', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new AutoScalingGroup(positive, 'rAsg', {
        vpc: new Vpc(positive, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        cooldown: Duration.seconds(0),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AS1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new AutoScalingGroup(negative, 'rAsg', {
        vpc: new Vpc(negative, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        cooldown: Duration.seconds(42),
      });
      new AutoScalingGroup(negative, 'rAsg2', {
        vpc: new Vpc(negative, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AS1:'),
          }),
        })
      );
    });
    test('awsSolutionsAs2: Auto Scaling Groups have properly configured health checks', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnAutoScalingGroup(positive, 'rAsg', {
        minSize: '7',
        maxSize: '42',
        healthCheckType: 'ELB',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AS2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new AutoScalingGroup(negative, 'rAsg', {
        vpc: new Vpc(negative, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        healthCheck: HealthCheck.elb({ grace: Duration.seconds(42) }),
      });
      new AutoScalingGroup(negative, 'rAsg2', {
        vpc: new Vpc(negative, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AS2:'),
          }),
        })
      );
    });
    test('awsSolutionsAs3: Auto Scaling Groups have notifications for all scaling events configured', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new AutoScalingGroup(positive, 'rAsg', {
        vpc: new Vpc(positive, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        notifications: [
          {
            scalingEvents: ScalingEvents.ERRORS,
            topic: new Topic(positive, 'rAsgTopic'),
          },
        ],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AS3:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new AutoScalingGroup(positive2, 'rAsg', {
        vpc: new Vpc(positive2, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AS3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const negTopic = new Topic(negative, 'rAsgTopic');
      new AutoScalingGroup(negative, 'rAsg', {
        vpc: new Vpc(negative, 'rVpc'),
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
      new AutoScalingGroup(negative, 'rAsg2', {
        vpc: new Vpc(negative, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        notifications: [
          {
            scalingEvents: ScalingEvents.ALL,
            topic: negTopic,
          },
        ],
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-AS3:'),
          }),
        })
      );
    });
  });
});

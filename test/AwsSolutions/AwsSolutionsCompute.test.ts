/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { AutoScalingGroup, Monitoring } from '@aws-cdk/aws-autoscaling';
import {
  CfnSecurityGroupIngress,
  Instance,
  InstanceClass,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  Volume,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { Repository } from '@aws-cdk/aws-ecr';
import { Cluster as EcsCluster, ExecuteCommandLogging } from '@aws-cdk/aws-ecs';
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import {
  CfnLoadBalancer,
  LoadBalancer,
  LoadBalancingProtocol,
} from '@aws-cdk/aws-elasticloadbalancing';
import { ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import {
  AccountPrincipal,
  AccountRootPrincipal,
  Effect,
  PolicyStatement,
} from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Size, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Solutions Compute Checks', () => {
  describe('AWS Elastic Beanstalk', () => {
    test('AwsSolutions-EB1: Elastic Beanstalk environments are configured to use a specific VPC', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new AwsSolutionsChecks());
      new CfnEnvironment(nonCompliant, 'rBeanstalk', {
        applicationName: 'foo',
      });
      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB1:'),
          }),
        })
      );

      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new AwsSolutionsChecks());
      new CfnEnvironment(nonCompliant2, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'VPCId',
          },
        ],
      });
      const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB1:'),
          }),
        })
      );

      const compliant = new Stack();
      Aspects.of(compliant).add(new AwsSolutionsChecks());
      new CfnEnvironment(compliant, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'VPCId',
            value: 'foo',
          },
        ],
      });
      const messages3 = SynthUtils.synthesize(compliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB1:'),
          }),
        })
      );
    });
    test('AwsSolutions-EB3: Elastic Beanstalk environments have managed updates enabled', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new AwsSolutionsChecks());
      new CfnEnvironment(nonCompliant, 'rBeanstalk', {
        applicationName: 'foo',
      });
      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB3:'),
          }),
        })
      );

      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new AwsSolutionsChecks());
      new CfnEnvironment(nonCompliant2, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'ManagedActionsEnabled',
            value: 'false',
          },
        ],
      });
      const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB3:'),
          }),
        })
      );

      const nonCompliant3 = new Stack();
      Aspects.of(nonCompliant3).add(new AwsSolutionsChecks());
      new CfnEnvironment(nonCompliant3, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'ManagedActionsEnabled',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'PreferredStartTime',
            value: 'Tue:09:00',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions:platformupdate',
            optionName: 'UpdateLevel',
          },
        ],
      });
      const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB3:'),
          }),
        })
      );

      const compliant = new Stack();
      Aspects.of(compliant).add(new AwsSolutionsChecks());
      new CfnEnvironment(compliant, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'ManagedActionsEnabled',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'PreferredStartTime',
            value: 'Tue:09:00',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions:platformupdate',
            optionName: 'UpdateLevel',
            value: 'minor',
          },
        ],
      });
      const messages4 = SynthUtils.synthesize(compliant).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB3:'),
          }),
        })
      );
    });
    test('AwsSolutions-EB4: EC2 instances in Elastic Beanstalk environments upload rotated logs to S3', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new AwsSolutionsChecks());
      new CfnEnvironment(nonCompliant, 'rBeanstalk', {
        applicationName: 'foo',
      });
      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB4:'),
          }),
        })
      );

      const nonCompliant2 = new Stack();
      Aspects.of(nonCompliant2).add(new AwsSolutionsChecks());
      new CfnEnvironment(nonCompliant2, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:hostmanager',
            optionName: 'LogPublicationControl',
          },
        ],
      });
      const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB4:'),
          }),
        })
      );

      const compliant = new Stack();
      Aspects.of(compliant).add(new AwsSolutionsChecks());
      new CfnEnvironment(compliant, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:hostmanager',
            optionName: 'LogPublicationControl',
            value: 'true',
          },
        ],
      });
      const messages3 = SynthUtils.synthesize(compliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EB4:'),
          }),
        })
      );
    });
  });
  describe('Amazon Elastic Compute Cloud (Amazon EC2)', () => {
    test('awsSolutionsEc23: EC2 security groups do not allow for 0.0.0.0/0 or ::/0 inbound access', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new SecurityGroup(positive, 'rSg', {
        vpc: new Vpc(positive, 'rVpc'),
      }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC23:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnSecurityGroupIngress(positive2, 'rIngress', {
        ipProtocol: 'tcp',
        cidrIp: '0.0.0.0/0',
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC23:'),
          }),
        })
      );

      const positive3 = new Stack();
      Aspects.of(positive3).add(new AwsSolutionsChecks());
      new CfnSecurityGroupIngress(positive3, 'rIngress', {
        ipProtocol: 'tcp',
        cidrIpv6: 'ff:ff:ff:ff:ff:ff:ff:ff/0',
      });
      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC23:'),
          }),
        })
      );

      const positive4 = new Stack();
      Aspects.of(positive4).add(new AwsSolutionsChecks());
      new SecurityGroup(positive4, 'rSg', {
        vpc: new Vpc(positive4, 'rVpc'),
      }).addIngressRule(Peer.anyIpv6(), Port.allTraffic());
      const messages4 = SynthUtils.synthesize(positive4).messages;
      expect(messages4).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC23:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new SecurityGroup(negative, 'rSg', {
        vpc: new Vpc(negative, 'rVpc'),
      }).addIngressRule(Peer.ipv4('1.2.3.4/32'), Port.allTraffic());

      new CfnSecurityGroupIngress(negative, 'rIngress', {
        ipProtocol: 'tcp',
        cidrIp: '1.2.3.4/32',
      });
      new CfnSecurityGroupIngress(negative, 'rIngress2', {
        ipProtocol: 'tcp',
        cidrIpv6: '1234:5678:9abc:def1:2345:6789:abcd:ef12/128',
      });
      new SecurityGroup(negative, 'rSg2', {
        vpc: new Vpc(negative, 'rVpc2'),
      });
      const messages5 = SynthUtils.synthesize(negative).messages;
      expect(messages5).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC23:'),
          }),
        })
      );
    });

    test('awsSolutionsEc27: Security Groups have descriptions', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new SecurityGroup(positive, 'rSg', {
        vpc: new Vpc(positive, 'rVpc'),
        description: ' ',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC27:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new SecurityGroup(negative, 'rSg', {
        vpc: new Vpc(negative, 'rVpc'),
        description: 'lorem ipsum dolor sit amet',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC27:'),
          }),
        })
      );
    });
    test('awsSolutionsEc28 for Instance: EC2 Instances have detailed monitoring enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Instance(positive, 'rInstance', {
        vpc: new Vpc(positive, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC28:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new AutoScalingGroup(positive2, 'rAsg', {
        vpc: new Vpc(positive2, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        instanceMonitoring: Monitoring.BASIC,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC28:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const instance = new Instance(negative, 'rInstance', {
        vpc: new Vpc(negative, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      instance.instance.monitoring = true;
      new AutoScalingGroup(negative, 'rAsg', {
        vpc: new Vpc(negative, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
        instanceMonitoring: Monitoring.DETAILED,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC28:'),
          }),
        })
      );
    });

    test('awsSolutionsEc29: EC2 Instances outside of an ASG have Termination Protection enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Instance(positive, 'rInstance', {
        vpc: new Vpc(positive, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC29:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const instance = new Instance(negative, 'rInstance', {
        vpc: new Vpc(negative, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });
      instance.instance.disableApiTermination = true;
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC29:'),
          }),
        })
      );
    });
  });
  describe('Amazon Elastic Block Store (EBS)', () => {
    test('awsSolutionsEc26: EBS volumes have encryption enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Volume(positive, 'rVolume', {
        availabilityZone: positive.availabilityZones[0],
        size: Size.gibibytes(42),
        encrypted: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC26:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Volume(negative, 'rVolume', {
        availabilityZone: negative.availabilityZones[0],
        size: Size.gibibytes(42),
        encrypted: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EC26:'),
          }),
        })
      );
    });
  });
  describe('Amazon Elastic Container Registry (ECR)', () => {
    test('awsSolutionsEcr1: ECR Repositories do not allow open access', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      const repo = new Repository(positive, 'rRepo');
      repo.addToResourcePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['*'],
          principals: [new AccountPrincipal('*'), new AccountRootPrincipal()],
        })
      );
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ECR1:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Repository(negative, 'rRepo');
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ECR1:'),
          }),
        })
      );
    });
  });
  describe('Amazon Elastic Container Service (Amazon ECS)', () => {
    test('awsSolutionsEcs4: ECS Cluster has CloudWatch Container Insights Enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new EcsCluster(positive, 'rCluster', { containerInsights: false });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ECS4:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new EcsCluster(negative, 'rCluster', { containerInsights: true });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ECS4:'),
          }),
        })
      );
    });
    test('awsSolutionsEcs7: ECS Task Definition has awslogs logging enabled at the minimum', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new EcsCluster(positive, 'rCluster', {});

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ECS7:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new EcsCluster(negative, 'rCluster', {
        executeCommandConfiguration: {
          logging: ExecuteCommandLogging.DEFAULT,
        },
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ECS7:'),
          }),
        })
      );
    });
  });
  describe('Elastic Load Balancing', () => {
    test('awsSolutionsElb1: CLBs are not used for incoming HTTP/HTTPS traffic', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      const elb = new LoadBalancer(positive, 'rELB', {
        vpc: new Vpc(positive, 'rVPC'),
      });
      elb.addListener({ externalPort: 80 });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const elb2 = new LoadBalancer(negative, 'rELB', {
        vpc: new Vpc(negative, 'rVPC'),
      });
      elb2.addListener({
        externalPort: 42,
        externalProtocol: LoadBalancingProtocol.SSL,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB1:'),
          }),
        })
      );
    });
    test('awsSolutionsElb2: ELBs have access logs enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new ApplicationLoadBalancer(positive, 'rALB', {
        vpc: new Vpc(positive, 'rVPC'),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB2:'),
          }),
        })
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new LoadBalancer(positive2, 'rELB', {
        vpc: new Vpc(positive2, 'rVPC'),
        accessLoggingPolicy: {
          s3BucketName: 'foo',
          enabled: false,
        },
      });
      const messages2 = SynthUtils.synthesize(positive).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB2:'),
          }),
        })
      );
      const negative = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LoadBalancer(negative, 'rELB', {
        vpc: new Vpc(negative, 'rVPC'),
        accessLoggingPolicy: {
          s3BucketName: 'foo',
          enabled: true,
        },
      });
      const alb = new ApplicationLoadBalancer(negative, 'rALB', {
        vpc: new Vpc(negative, 'rVPC2'),
      });
      alb.logAccessLogs(new Bucket(negative, 'rLogsBucket'));
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB2:'),
          }),
        })
      );
    });
    test('awsSolutionsElb3: CLBs have connection draining enabled', () => {
      const positive = new Stack();
      const positive2 = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new LoadBalancer(positive, 'rELB', {
        vpc: new Vpc(positive, 'rVPC'),
      });
      new CfnLoadBalancer(positive2, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        connectionDrainingPolicy: { enabled: false },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB3:'),
          }),
        })
      );
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB3:'),
          }),
        })
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnLoadBalancer(negative, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        connectionDrainingPolicy: { enabled: true },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB3:'),
          }),
        })
      );
    });
    test('awsSolutionsElb4: ELBs use at least two AZs with the Cross-Zone Load Balancing feature enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LoadBalancer(positive, 'rELB', {
        vpc: new Vpc(positive, 'rVPC'),
        crossZone: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB4:'),
          }),
        })
      );
      const positive2 = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnLoadBalancer(positive2, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        crossZone: true,
        availabilityZones: [positive2.availabilityZones[0]],
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB4:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LoadBalancer(negative, 'rELB', {
        vpc: new Vpc(negative, 'rVPC'),
        crossZone: true,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB4:'),
          }),
        })
      );
      const negative2 = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(negative2).add(new AwsSolutionsChecks());
      new CfnLoadBalancer(negative2, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        crossZone: true,
        availabilityZones: negative2.availabilityZones,
      });
      const messages4 = SynthUtils.synthesize(negative2).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB4:'),
          }),
        })
      );
    });
    test('awsSolutionsElb5: ELB listeners should be configured for secure (HTTPs or SSL) protocols for client communication', () => {
      const positive = new Stack();
      const positive2 = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      const lb = new LoadBalancer(positive, 'rELB', {
        vpc: new Vpc(positive, 'rVPC'),
      });
      lb.addListener({
        internalProtocol: LoadBalancingProtocol.TCP,
        externalPort: 42,
        externalProtocol: LoadBalancingProtocol.SSL,
      });
      const lb2 = new LoadBalancer(positive2, 'rELB', {
        vpc: new Vpc(positive2, 'rVPC'),
      });
      lb2.addListener({
        internalProtocol: LoadBalancingProtocol.HTTP,
        externalPort: 443,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB5:'),
          }),
        })
      );
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB5:'),
          }),
        })
      );
      const negative = new Stack();
      const negative2 = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      Aspects.of(negative2).add(new AwsSolutionsChecks());
      const lb3 = new LoadBalancer(negative, 'rELB', {
        vpc: new Vpc(negative, 'rVPC'),
      });
      lb3.addListener({
        internalProtocol: LoadBalancingProtocol.SSL,
        externalPort: 42,
        externalProtocol: LoadBalancingProtocol.SSL,
      });
      const lb4 = new LoadBalancer(negative2, 'rELB', {
        vpc: new Vpc(negative2, 'rVPC'),
      });
      lb4.addListener({
        internalProtocol: LoadBalancingProtocol.HTTPS,
        externalPort: 443,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB5:'),
          }),
        })
      );
      const messages4 = SynthUtils.synthesize(negative2).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ELB5:'),
          }),
        })
      );
    });
  });
});

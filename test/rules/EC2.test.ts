/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  AutoScalingGroup,
  CfnAutoScalingGroup,
  CfnLaunchConfiguration,
  Monitoring,
  BlockDeviceVolume as ASBlockDeviceVolume,
} from 'aws-cdk-lib/aws-autoscaling';
import { BackupPlan, BackupResource } from 'aws-cdk-lib/aws-backup';
import {
  BlockDeviceVolume,
  CfnInstance,
  CfnLaunchTemplate,
  CfnSecurityGroup,
  CfnSecurityGroupIngress,
  CfnVolume,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  LaunchTemplate,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  Volume,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Aspects, Size, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
import {
  EC2EBSInBackupPlan,
  EC2EBSOptimizedInstance,
  EC2EBSVolumeEncrypted,
  EC2IMDSv2Enabled,
  EC2InstanceDetailedMonitoringEnabled,
  EC2InstanceNoPublicIp,
  EC2InstanceProfileAttached,
  EC2InstanceTerminationProtection,
  EC2InstancesInVPC,
  EC2RestrictedCommonPorts,
  EC2RestrictedInbound,
  EC2RestrictedSSH,
  EC2SecurityGroupDescription,
  EC2SecurityGroupOnlyTcp443,
} from '../../src/rules/ec2';

const testPack = new TestPack([
  EC2EBSInBackupPlan,
  EC2EBSOptimizedInstance,
  EC2EBSVolumeEncrypted,
  EC2IMDSv2Enabled,
  EC2InstanceDetailedMonitoringEnabled,
  EC2InstanceNoPublicIp,
  EC2InstanceProfileAttached,
  EC2InstanceTerminationProtection,
  EC2InstancesInVPC,
  EC2RestrictedCommonPorts,
  EC2RestrictedInbound,
  EC2RestrictedSSH,
  EC2SecurityGroupDescription,
  EC2SecurityGroupOnlyTcp443,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Elastic Compute Cloud (Amazon EC2)', () => {
  describe('EC2EBSInBackupPlan: EBS volumes are part of AWS Backup plan(s)', () => {
    const ruleId = 'EC2EBSInBackupPlan';
    test('Noncompliance 1', () => {
      new Volume(stack, 'rVolume', {
        availabilityZone: 'us-east-1a',
        size: Size.gibibytes(42),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Volume(stack, 'rVolume', {
        availabilityZone: 'us-east-1a',
        size: Size.gibibytes(42),
      });
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan').addSelection(
        'Selection',
        {
          resources: [
            BackupResource.fromArn(
              'arn:aws:ec2:us-east-1:123456789012:volume/' +
                new Volume(stack, 'rVolume2', {
                  availabilityZone: 'us-east-1a',
                  size: Size.gibibytes(42),
                }).volumeId
            ),
          ],
        }
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      BackupPlan.dailyWeeklyMonthly5YearRetention(stack, 'rPlan').addSelection(
        'Selection',
        {
          resources: [
            BackupResource.fromArn(
              'arn:aws:ec2:us-east-1:123456789012:volume/' +
                new Volume(stack, 'rVolume', {
                  availabilityZone: 'us-east-1a',
                  size: Size.gibibytes(42),
                }).volumeId
            ),
          ],
        }
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2EBSOptimizedInstance: EC2 instance types that support EBS optimization and are not EBS optimized by default have EBS optimization enabled', () => {
    const ruleId = 'EC2EBSOptimizedInstance';
    test('Noncompliance 1', () => {
      new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: InstanceType.of(InstanceClass.C3, InstanceSize.XLARGE),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: InstanceType.of(InstanceClass.C3, InstanceSize.XLARGE),
        machineImage: MachineImage.latestAmazonLinux2(),
      }).instance.ebsOptimized = true;
      new Instance(stack, 'rInstance2', {
        vpc: new Vpc(stack, 'rVpc2'),
        instanceType: InstanceType.of(InstanceClass.A1, InstanceSize.MEDIUM),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      new CfnInstance(stack, 'rInstance3');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2InstanceDetailedMonitoringEnabled: EC2 instances have detailed monitoring enabled', () => {
    const ruleId = 'EC2InstanceDetailedMonitoringEnabled';
    test('Noncompliance 1', () => {
      new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 1', () => {
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        instanceMonitoring: Monitoring.BASIC,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      }).instance.monitoring = true;
      new AutoScalingGroup(stack, 'rAsg', {
        vpc: new Vpc(stack, 'rVpc2'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        instanceMonitoring: Monitoring.DETAILED,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2InstanceNoPublicIp: EC2 instances do not have public IPs', () => {
    const ruleId = 'EC2InstanceNoPublicIp';
    test('Noncompliance 1', () => {
      new CfnInstance(stack, 'rInstance', {
        imageId: 'nonCompliantInstance',
        networkInterfaces: [
          {
            associatePublicIpAddress: true,
            deviceIndex: '0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnInstance(stack, 'rInstance1', {
        imageId: 'compliantInstance',
        networkInterfaces: [
          {
            associatePublicIpAddress: false,
            deviceIndex: '0',
          },
        ],
      });
      new CfnInstance(stack, 'rInstance2', {
        imageId: 'compliantInstance',
        networkInterfaces: [],
      });
      new Instance(stack, 'rInstance3', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2InstanceProfileAttached: EC2 instances have an instance profile attached', () => {
    const ruleId = 'EC2InstanceProfileAttached';
    test('Noncompliance 1', () => {
      new CfnInstance(stack, 'rInstance');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: InstanceType.of(InstanceClass.C3, InstanceSize.XLARGE),
        machineImage: MachineImage.latestAmazonLinux2(),
      }).addToRolePolicy(
        new PolicyStatement({
          actions: ['s3:ListAllMyBuckets'],
          resources: ['arn:aws:s3:::*'],
        })
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2InstanceTerminationProtection: EC2 Instances outside of an ASG have Termination Protection enabled', () => {
    const ruleId = 'EC2InstanceTerminationProtection';
    test('Noncompliance 1', () => {
      new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      const instance = new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      instance.instance.disableApiTermination = true;
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2InstancesInVPC: EC2 instances are created within VPCs', () => {
    const ruleId = 'EC2InstancesInVPC';
    test('Noncompliance 1', () => {
      new CfnInstance(stack, 'rInstance1', {
        imageId: 'nonCompliantInstance',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnInstance(stack, 'rInstance2', {
        imageId: 'compliantInstance',
        subnetId: 'describeSubnet',
      });
      new Instance(stack, 'rInstance', {
        vpc: new Vpc(stack, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2RestrictedCommonPorts: EC2 instances have all common TCP ports restricted for ingress IPv4 traffic', () => {
    const ruleId = 'EC2RestrictedCommonPorts';
    test('Noncompliance 1', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup', {
        groupDescription: 'security group tcp port 20 open',
        securityGroupIngress: [
          {
            fromPort: 20,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup', {
        groupDescription: 'security group with SSH unrestricted',
        securityGroupIngress: [
          {
            fromPort: 21,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
      }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup', {
        groupDescription: 'security group with port 21 open',
        securityGroupIngress: [
          {
            fromPort: 1,
            toPort: 10000,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup1', {
        groupDescription: 'security group with no rules',
        securityGroupIngress: [],
      });
      new CfnSecurityGroup(stack, 'rSecurityGroup2', {
        groupDescription:
          'security group with SSH ingress allowed for a specific IP address',
        securityGroupIngress: [
          {
            fromPort: 21,
            ipProtocol: 'tcp',
            cidrIp: '72.21.210.165',
          },
        ],
      });
      new CfnSecurityGroup(stack, 'rSecurityGroup3', {
        groupDescription:
          'security group with an open-world ingress rule for HTTP traffic',
        securityGroupIngress: [
          {
            fromPort: 80,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      new CfnSecurityGroup(stack, 'rSecurityGroup4', {
        groupDescription: 'security group allowing unrestricted udp traffic',
        securityGroupIngress: [
          {
            fromPort: 21,
            ipProtocol: 'udp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2RestrictedInbound: EC2 security groups do not allow for 0.0.0.0/0 or ::/0 inbound access', () => {
    const ruleId = 'EC2RestrictedInbound';
    test('Noncompliance 1', () => {
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
      }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnSecurityGroupIngress(stack, 'rIngress', {
        ipProtocol: 'tcp',
        cidrIp: '0.0.0.0/0',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnSecurityGroupIngress(stack, 'rIngress', {
        ipProtocol: 'tcp',
        cidrIpv6: 'ff:ff:ff:ff:ff:ff:ff:ff/0',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
      }).addIngressRule(Peer.anyIpv6(), Port.allTraffic());
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
      }).addIngressRule(Peer.ipv4('1.2.3.4/32'), Port.allTraffic());
      new CfnSecurityGroupIngress(stack, 'rIngress', {
        ipProtocol: 'tcp',
        cidrIp: '1.2.3.4/32',
      });
      new CfnSecurityGroupIngress(stack, 'rIngress2', {
        ipProtocol: 'tcp',
        cidrIpv6: '1234:5678:9abc:def1:2345:6789:abcd:ef12/128',
      });
      new SecurityGroup(stack, 'rSg2', {
        vpc: new Vpc(stack, 'rVpc2'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2RestrictedSSH: Security Groups do not allow for unrestricted SSH traffic', () => {
    const ruleId = 'EC2RestrictedSSH';
    test('Noncompliance 1', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup', {
        groupDescription: 'security group with SSH unrestricted',
        securityGroupIngress: [
          {
            fromPort: 22,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup', {
        groupDescription: 'security group with SSH unrestricted',
        securityGroupIngress: [
          {
            fromPort: 22,
            ipProtocol: 'tcp',
            cidrIpv6: '::/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
      }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup', {
        groupDescription: 'security group with SSH unrestricted',
        securityGroupIngress: [
          {
            fromPort: 1,
            toPort: 10000,
            ipProtocol: 'tcp',
            cidrIpv6: '::/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5', () => {
      new CfnSecurityGroupIngress(stack, 'rSgIngress', {
        fromPort: 1,
        toPort: 10000,
        ipProtocol: 'tcp',
        cidrIp: '1.0.0.0/0',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnSecurityGroup(stack, 'rSecurityGroup1', {
        groupDescription: 'security group with no rules',
        securityGroupIngress: [],
      });
      new CfnSecurityGroup(stack, 'rSecurityGroup2', {
        groupDescription:
          'security group with SSH ingress allowed for a specific IP address',
        securityGroupIngress: [
          {
            fromPort: 22,
            ipProtocol: 'tcp',
            cidrIp: '72.21.210.165',
          },
        ],
      });
      new CfnSecurityGroup(stack, 'rSecurityGroup3', {
        groupDescription:
          'security group with an open-world ingress rule for HTTP traffic',
        securityGroupIngress: [
          {
            fromPort: 80,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EC2SecurityGroupDescription: Security Groups have descriptions', () => {
    const ruleId = 'EC2SecurityGroupDescription';
    test('Noncompliance 1', () => {
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
        description: ' ',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new SecurityGroup(stack, 'rSg', {
        vpc: new Vpc(stack, 'rVpc'),
        description: 'lorem ipsum dolor sit amet',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
  describe('EC2IMDSv2Enabled: EC2 Instances require IMDSv2', () => {
    const ruleId = 'EC2IMDSv2Enabled';
    describe('EC2', () => {
      test('Noncompliance 1', () => {
        const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
          launchTemplateData: {
            instanceType: 't3.small',
            metadataOptions: {
              httpTokens: 'optional',
            },
          },
        });

        new CfnInstance(stack, 'Instance', {
          imageId: 'ami-00112233444',
          instanceType: 't3.micro',
          subnetId: 'subnet-0123455667',
          launchTemplate: {
            version: launchTemplate.attrLatestVersionNumber,
            launchTemplateId: launchTemplate.ref,
          },
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });
      test('Noncompliance 2', () => {
        const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
          launchTemplateData: {
            instanceType: 't3.small',
          },
        });
        new CfnInstance(stack, 'Instance', {
          imageId: 'ami-00112233444',
          instanceType: 't3.micro',
          subnetId: 'subnet-0123455667',
          launchTemplate: {
            version: launchTemplate.attrLatestVersionNumber,
            launchTemplateId: launchTemplate.ref,
          },
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });
      test('Noncompliance 3', () => {
        const vpc = new Vpc(stack, 'Vpc', {});
        new Instance(stack, 'Instance', {
          vpc: vpc,
          instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
          machineImage: MachineImage.latestAmazonLinux2(),
          requireImdsv2: false,
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });

      test('Compliance', () => {
        const vpc = new Vpc(stack, 'Vpc', {});
        new Instance(stack, 'Instance', {
          vpc: vpc,
          instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
          machineImage: MachineImage.latestAmazonLinux2(),
          requireImdsv2: true,
        });
        const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
          launchTemplateData: {
            instanceType: 't3.small',
            metadataOptions: {
              httpTokens: 'required',
            },
          },
        });
        new CfnInstance(stack, 'Instance2', {
          imageId: 'ami-00112233444',
          instanceType: 't3.micro',
          subnetId: 'subnet-0123455667',
          launchTemplate: {
            version: launchTemplate.attrLatestVersionNumber,
            launchTemplateId: launchTemplate.ref,
          },
        });
        validateStack(stack, ruleId, TestType.COMPLIANCE);
      });
    });
    describe('Autoscaling Groups', () => {
      test('Noncompliance 1', () => {
        const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
          launchTemplateData: {
            instanceType: 't3.small',
          },
        });
        new CfnAutoScalingGroup(stack, 'ASG', {
          maxSize: '2',
          minSize: '1',
          launchTemplate: {
            version: launchTemplate.attrLatestVersionNumber,
            launchTemplateId: launchTemplate.ref,
          },
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });
      test('Noncompliance 2', () => {
        const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
          launchTemplateData: {
            instanceType: 't3.small',
            metadataOptions: {
              httpTokens: 'optional',
            },
          },
        });

        new CfnAutoScalingGroup(stack, 'ASG', {
          maxSize: '2',
          minSize: '1',
          launchTemplate: {
            version: launchTemplate.attrLatestVersionNumber,
            launchTemplateName: launchTemplate.launchTemplateName,
          },
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });

      test('Noncompliance 3', () => {
        const launchConfig = new CfnLaunchConfiguration(stack, 'LaunchConfig', {
          imageId: 'ami-123456',
          instanceType: 't3.small',
          launchConfigurationName: 'foobar',
        });

        new CfnAutoScalingGroup(stack, 'ASG', {
          maxSize: '2',
          minSize: '1',
          launchConfigurationName: launchConfig.launchConfigurationName,
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });

      test('Noncompliance 4', () => {
        const launchConfig = new CfnLaunchConfiguration(
          stack,
          'LaunchTemplate',
          {
            imageId: 'ami-123456',
            instanceType: 't3.small',
            metadataOptions: {
              httpTokens: 'optional',
            },
            launchConfigurationName: 'foobar',
          }
        );

        new CfnAutoScalingGroup(stack, 'ASG', {
          maxSize: '2',
          minSize: '1',
          launchConfigurationName: launchConfig.launchConfigurationName,
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });

      test('Noncompliance 5', () => {
        const launchConfig = new CfnLaunchConfiguration(
          stack,
          'LaunchTemplate',
          {
            imageId: 'ami-123456',
            instanceType: 't3.small',
            launchConfigurationName: 'foobar',
          }
        );

        new CfnAutoScalingGroup(stack, 'ASG', {
          maxSize: '2',
          minSize: '1',
          launchConfigurationName: launchConfig.launchConfigurationName,
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });
      test('Noncompliance 6', () => {
        const launchConfig = new CfnLaunchConfiguration(
          stack,
          'LaunchTemplate',
          {
            imageId: 'ami-123456',
            instanceType: 't3.small',
          }
        );

        new CfnAutoScalingGroup(stack, 'ASG', {
          maxSize: '2',
          minSize: '1',
          launchConfigurationName: launchConfig.ref,
        });
        validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
      });
      test('Compliance', () => {
        const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
          launchTemplateData: {
            instanceType: 't3.small',
            metadataOptions: {
              httpTokens: 'required',
            },
          },
        });
        new CfnAutoScalingGroup(stack, 'ASG1', {
          maxSize: '2',
          minSize: '1',
          launchTemplate: {
            version: launchTemplate.attrLatestVersionNumber,
            launchTemplateId: launchTemplate.ref,
          },
        });
        const launchConfig = new CfnLaunchConfiguration(stack, 'LaunchConfig', {
          imageId: 'ami-123456',
          instanceType: 't3.small',
          metadataOptions: {
            httpTokens: 'required',
          },
          launchConfigurationName: 'foobar',
        });

        new CfnAutoScalingGroup(stack, 'ASG2', {
          maxSize: '2',
          minSize: '1',
          launchConfigurationName: launchConfig.launchConfigurationName,
        });
        const launchConfig2 = new CfnLaunchConfiguration(
          stack,
          'LaunchConfig2',
          {
            imageId: 'ami-123456',
            instanceType: 't3.small',
            metadataOptions: {
              httpTokens: 'required',
            },
          }
        );
        new CfnAutoScalingGroup(stack, 'ASG3', {
          maxSize: '2',
          minSize: '1',
          launchConfigurationName: launchConfig2.ref,
        });
        const launchConfig3 = new CfnLaunchConfiguration(
          stack,
          'LaunchConfig3',
          {
            imageId: 'ami-123456',
            instanceType: 't3.small',
            metadataOptions: {
              httpTokens: 'required',
            },
            launchConfigurationName: 'foobarbaz',
          }
        );
        new CfnAutoScalingGroup(stack, 'ASG4', {
          maxSize: '2',
          minSize: '1',
          launchConfigurationName: launchConfig3.ref,
        });
        validateStack(stack, ruleId, TestType.COMPLIANCE);
      });
    });
  });
});

describe('Amazon Elastic Block Store (EBS)', () => {
  describe('EC2EBSVolumeEncrypted: EBS volumes have encryption enabled', () => {
    const ruleId = 'EC2EBSVolumeEncrypted';
    test('Noncompliance 1 - Volume', () => {
      new Volume(stack, 'Volume', {
        availabilityZone: stack.availabilityZones[0],
        size: Size.gibibytes(42),
        encrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2 - CfnVolume', () => {
      new CfnVolume(stack, 'Volume', {
        availabilityZone: stack.availabilityZones[0],
        encrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3 - LaunchTemplate used by instance', () => {
      const launchTemplate = new LaunchTemplate(stack, 'LaunchTemplate', {
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: false }),
          },
        ],
      });
      const instance = new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      instance.instance.launchTemplate = {
        version: launchTemplate.versionNumber,
        launchTemplateId: launchTemplate.launchTemplateId,
      };
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4 - LaunchTemplate used by instance (blockDevices is not configured)', () => {
      const launchTemplate = new LaunchTemplate(stack, 'LaunchTemplate', {});
      const instance = new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      instance.instance.launchTemplate = {
        version: launchTemplate.versionNumber,
        launchTemplateId: launchTemplate.launchTemplateId,
      };
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5 - LaunchTemplate used by instance (blockDevices is an empty array)', () => {
      const launchTemplate = new LaunchTemplate(stack, 'LaunchTemplate', {
        blockDevices: [],
      });
      const instance = new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [],
      });
      instance.instance.launchTemplate = {
        version: launchTemplate.versionNumber,
        launchTemplateId: launchTemplate.launchTemplateId,
      };
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 6 - CfnLaunchTemplate used by instance', () => {
      const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
        launchTemplateData: {
          blockDeviceMappings: [{ ebs: { encrypted: false } }],
        },
      });
      const instance = new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      instance.instance.launchTemplate = {
        version: launchTemplate.getAtt('LatestVersionNumber').toString(),
        launchTemplateName: launchTemplate.launchTemplateName,
      };
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 7 - CfnLaunchTemplate used by instance (blockDeviceMappings is not configured)', () => {
      const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
        launchTemplateData: {},
      });
      const instance = new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      instance.instance.launchTemplate = {
        version: launchTemplate.getAtt('LatestVersionNumber').toString(),
        launchTemplateName: launchTemplate.launchTemplateName,
      };
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 8 - LaunchTemplate used by AutoScalingGroup', () => {
      const launchTemplate = new LaunchTemplate(stack, 'LaunchTemplate', {
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: false }),
          },
        ],
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      new AutoScalingGroup(stack, 'Asg', {
        vpc: new Vpc(stack, 'Vpc'),
        launchTemplate: launchTemplate,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 9 - CfnLaunchTemplate used by CfnAutoScalingGroup', () => {
      const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
        launchTemplateData: {},
      });
      new CfnAutoScalingGroup(stack, 'Asg', {
        launchTemplate: {
          version: launchTemplate.getAtt('LatestVersionNumber').toString(),
          launchTemplateName: launchTemplate.launchTemplateName,
        },
        minSize: '1',
        maxSize: '1',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 10 - Instance', () => {
      new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc', {}),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: false }),
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 11 - Instance (blockDevices is not configured)', () => {
      new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc', {}),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 12 - Instance (overwriting LaunchTemplate configuration)', () => {
      const launchTemplate = new CfnLaunchTemplate(stack, 'LaunchTemplate', {
        launchTemplateData: {
          blockDeviceMappings: [{ ebs: { encrypted: true } }],
        },
      });
      const instance = new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc', {}),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: false }),
          },
        ],
      });
      instance.instance.launchTemplate = {
        version: launchTemplate.getAtt('LatestVersionNumber').toString(),
        launchTemplateName: launchTemplate.launchTemplateName,
      };
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 13 - Instance (using LaunchTemplate which configures unencrypted volume)', () => {
      const launchTemplate = new LaunchTemplate(stack, 'LaunchTemplate', {
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: false }),
          },
        ],
      });
      const instance = new Instance(stack, 'Instance', {
        vpc: new Vpc(stack, 'Vpc', {}),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: true }),
          },
        ],
      });
      instance.instance.launchTemplate = {
        version: launchTemplate.versionNumber,
        launchTemplateId: launchTemplate.launchTemplateId,
      };
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 14 - CfnInstance', () => {
      new CfnInstance(stack, 'Instance', {
        blockDeviceMappings: [
          { deviceName: 'device', ebs: { encrypted: false } },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 15 - CfnInstance (blockDeviceMappings is not configured)', () => {
      new CfnInstance(stack, 'Instance', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 16 - AutoScalingGroup', () => {
      new AutoScalingGroup(stack, 'Asg', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [
          {
            deviceName: 'device',
            volume: ASBlockDeviceVolume.ebs(1, { encrypted: false }),
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 17 - AutoScalingGroup (blockDevices is not configured)', () => {
      new AutoScalingGroup(stack, 'Asg', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 18 - CfnLaunchConfiguration', () => {
      new CfnLaunchConfiguration(stack, 'LaunchConfig', {
        imageId: 'ami-123456',
        instanceType: 't3.small',
        blockDeviceMappings: [
          { deviceName: 'device', ebs: { encrypted: false } },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 19 - CfnLaunchConfiguration (blockDeviceMappings is not configured)', () => {
      new CfnLaunchConfiguration(stack, 'LaunchConfig', {
        imageId: 'ami-123456',
        instanceType: 't3.small',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance 1 - Volume', () => {
      new Volume(stack, 'Volume1', {
        availabilityZone: stack.availabilityZones[0],
        size: Size.gibibytes(42),
        encrypted: true,
      });
      new CfnVolume(stack, 'Volume2', {
        availabilityZone: stack.availabilityZones[0],
        encrypted: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 2 - LaunchTemplate configuring an encrypted volume', () => {
      const vpc = new Vpc(stack, 'Vpc');
      const launchTemplate1 = new LaunchTemplate(stack, 'LaunchTemplate1', {
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: true }),
          },
        ],
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      const instance1 = new Instance(stack, 'Instance1', {
        vpc: vpc,
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      instance1.instance.launchTemplate = {
        version: launchTemplate1.versionNumber,
        launchTemplateId: launchTemplate1.launchTemplateId,
      };
      new AutoScalingGroup(stack, 'Asg1', {
        vpc: vpc,
        launchTemplate: launchTemplate1,
      });
      const launchTemplate2 = new CfnLaunchTemplate(stack, 'LaunchTemplate2', {
        launchTemplateData: {
          blockDeviceMappings: [{ ebs: { encrypted: true } }],
        },
      });
      const instance2 = new Instance(stack, 'Instance2', {
        vpc: vpc,
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
      });
      instance2.instance.launchTemplate = {
        version: launchTemplate2.getAtt('LatestVersionNumber').toString(),
        launchTemplateName: launchTemplate2.launchTemplateName,
      };
      new CfnAutoScalingGroup(stack, 'Asg2', {
        launchTemplate: {
          version: launchTemplate2.getAtt('LatestVersionNumber').toString(),
          launchTemplateName: launchTemplate2.launchTemplateName,
        },
        minSize: '1',
        maxSize: '1',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 3 - LaunchTemplate not in use', () => {
      new LaunchTemplate(stack, 'LaunchTemplate1', {});
      new CfnLaunchTemplate(stack, 'LaunchTemplate2', {
        launchTemplateData: {},
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 4 - Instance', () => {
      const vpc = new Vpc(stack, 'Vpc');
      new Instance(stack, 'Instance1', {
        vpc: vpc,
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: true }),
          },
        ],
      });
      new Instance(stack, 'Instance2', {
        vpc: vpc,
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [
          {
            deviceName: 'device',
            volume: BlockDeviceVolume.ebs(1, { encrypted: true }),
          },
        ],
        requireImdsv2: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 5 - CfnInstance', () => {
      new CfnInstance(stack, 'Instance', {
        blockDeviceMappings: [
          { deviceName: 'device', ebs: { encrypted: true } },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 6 - LaunchConfiguration', () => {
      new AutoScalingGroup(stack, 'Asg', {
        vpc: new Vpc(stack, 'Vpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux2(),
        blockDevices: [
          {
            deviceName: 'device',
            volume: ASBlockDeviceVolume.ebs(1, { encrypted: true }),
          },
        ],
      });
      new CfnLaunchConfiguration(stack, 'LaunchConfig', {
        imageId: 'ami-123456',
        instanceType: 't3.small',
        blockDeviceMappings: [
          { deviceName: 'device', ebs: { encrypted: true } },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

describe('EC2SecurityGroupOnlyTcp443: Security Groups should only allow TCP 443 from everything', () => {
  const ruleId = 'EC2SecurityGroupOnlyTcp443';

  test('a non compliant ipv6 rule', () => {
    new CfnSecurityGroup(stack, 'SecurityGroup', {
      groupDescription: 'security group tcp port 80 open on port 80',
      securityGroupIngress: [
        {
          toPort: 80,
          ipProtocol: 'tcp',
          cidrIpv6: '::0/0',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  test('a compliant ipv6 rule', () => {
    new CfnSecurityGroup(stack, 'rSecurityGroup', {
      groupDescription: 'ipv6 to non ::0/0',
      securityGroupIngress: [
        {
          toPort: 80,
          ipProtocol: 'tcp',
          cidrIpv6: '2002::1234:abcd:ffff:c0a8:101/64',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('no specified port', () => {
    new CfnSecurityGroup(stack, 'rSecurityGroup', {
      groupDescription: 'security group tcp port 80 open',
      securityGroupIngress: [
        {
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  test('tcp port other than 443 from 0/0', () => {
    new CfnSecurityGroup(stack, 'rSecurityGroup', {
      groupDescription: 'security group tcp port 80 open',
      securityGroupIngress: [
        {
          toPort: 80,
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  test('udp port from 0/0', () => {
    new CfnSecurityGroup(stack, 'rSecurityGroup2', {
      groupDescription: 'security group with udp port 53',
      securityGroupIngress: [
        {
          toPort: 53,
          ipProtocol: 'udp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  test('ipv4 tcp443 from anywhere', () => {
    new CfnSecurityGroup(stack, 'rSecurityGroup2', {
      groupDescription: 'security group with tcp 443 ingress allowed',
      securityGroupIngress: [
        {
          toPort: 443,
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('tcp80 from 10/8', () => {
    new CfnSecurityGroup(stack, 'SecurityGroup2', {
      groupDescription: 'security group with tcp 443 ingress allowed',
      securityGroupIngress: [
        {
          toPort: 80,
          ipProtocol: 'tcp',
          cidrIp: '10.0.0.0/8',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('ingressGroupCompliant', () => {
    new CfnSecurityGroupIngress(stack, 'ingressGroup', {
      ipProtocol: 'tcp',
      toPort: 443,
      cidrIp: '0.0.0.0/0',
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('ingressGroupNonCompliant', () => {
    new CfnSecurityGroupIngress(stack, 'ingressGroup', {
      ipProtocol: 'tcp',
      toPort: 80,
      cidrIp: '0.0.0.0/0',
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  test('ingressGroupNonCompliant', () => {
    new CfnSecurityGroupIngress(stack, 'ingressGroup', {
      ipProtocol: 'tcp',
      toPort: 443,
      cidrIp: '10.0.0.0/8',
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('ingressgroup, ipv6 compliant', () => {
    new CfnSecurityGroupIngress(stack, 'ingressGroup', {
      ipProtocol: 'tcp',
      toPort: 443,
      cidrIpv6: '::/0',
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('ingressGroup, non compliant', () => {
    new CfnSecurityGroupIngress(stack, 'ingressGroup', {
      ipProtocol: 'tcp',
      toPort: 80,
      cidrIpv6: '::/0',
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  test('ingressGroupnonopenCompliant', () => {
    new CfnSecurityGroupIngress(stack, 'ingressGroup', {
      ipProtocol: 'tcp',
      toPort: 80,
      cidrIpv6: 'FE80:CD00:0:CDE:1257:0:211E:729C/64',
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });
});

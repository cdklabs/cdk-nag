/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack, Size } from 'aws-cdk-lib';
import { AutoScalingGroup, Monitoring } from 'aws-cdk-lib/aws-autoscaling';
import { BackupPlan, BackupResource } from 'aws-cdk-lib/aws-backup';
import {
  Instance,
  InstanceClass,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  Vpc,
  CfnInstance,
  CfnSecurityGroupIngress,
  CfnSecurityGroup,
  InstanceSize,
  Volume,
} from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  EC2EBSInBackupPlan,
  EC2EBSOptimizedInstance,
  EC2EBSVolumeEncrypted,
  EC2InstanceDetailedMonitoringEnabled,
  EC2InstanceNoPublicIp,
  EC2InstanceProfileAttached,
  EC2InstanceTerminationProtection,
  EC2InstancesInVPC,
  EC2RestrictedCommonPorts,
  EC2RestrictedInbound,
  EC2RestrictedSSH,
  EC2SecurityGroupDescription,
} from '../../src/rules/ec2';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        EC2EBSInBackupPlan,
        EC2EBSOptimizedInstance,
        EC2EBSVolumeEncrypted,
        EC2InstanceDetailedMonitoringEnabled,
        EC2InstanceNoPublicIp,
        EC2InstanceProfileAttached,
        EC2InstanceTerminationProtection,
        EC2InstancesInVPC,
        EC2RestrictedCommonPorts,
        EC2RestrictedInbound,
        EC2RestrictedSSH,
        EC2SecurityGroupDescription,
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

describe('Amazon Elastic Compute Cloud (Amazon EC2)', () => {
  test('EC2EBSInBackupPlan: EBS volumes are part of AWS Backup plan(s)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Volume(nonCompliant, 'rVolume', {
      availabilityZone: 'us-east-1a',
      size: Size.gibibytes(42),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2EBSInBackupPlan:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Volume(nonCompliant2, 'rVolume', {
      availabilityZone: 'us-east-1a',
      size: Size.gibibytes(42),
    });
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      nonCompliant2,
      'rPlan'
    ).addSelection('Selection', {
      resources: [
        BackupResource.fromArn(
          'arn:aws:ec2:us-east-1:123456789012:volume/' +
            new Volume(nonCompliant2, 'rVolume2', {
              availabilityZone: 'us-east-1a',
              size: Size.gibibytes(42),
            }).volumeId
        ),
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2EBSInBackupPlan:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      compliant,
      'rPlan'
    ).addSelection('Selection', {
      resources: [
        BackupResource.fromArn(
          'arn:aws:ec2:us-east-1:123456789012:volume/' +
            new Volume(compliant, 'rVolume', {
              availabilityZone: 'us-east-1a',
              size: Size.gibibytes(42),
            }).volumeId
        ),
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2EBSInBackupPlan:'),
        }),
      })
    );
  });

  test('EC2EBSOptimizedInstance: EC2 instance types that support EBS optimization and are not EBS optimized by default have EBS optimization enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Instance(nonCompliant, 'rInstance', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      instanceType: InstanceType.of(InstanceClass.C3, InstanceSize.XLARGE),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2EBSOptimizedInstance:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Instance(compliant, 'rInstance', {
      vpc: new Vpc(compliant, 'rVpc'),
      instanceType: InstanceType.of(InstanceClass.C3, InstanceSize.XLARGE),
      machineImage: MachineImage.latestAmazonLinux(),
    }).instance.ebsOptimized = true;
    new Instance(compliant, 'rInstance2', {
      vpc: new Vpc(compliant, 'rVpc2'),
      instanceType: InstanceType.of(InstanceClass.A1, InstanceSize.MEDIUM),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    new CfnInstance(compliant, 'rInstance3');
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2EBSOptimizedInstance:'),
        }),
      })
    );
  });

  test('EC2InstanceDetailedMonitoringEnabled: EC2 instances have detailed monitoring enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Instance(nonCompliant, 'rInstance', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'EC2InstanceDetailedMonitoringEnabled:'
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
      instanceMonitoring: Monitoring.BASIC,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'EC2InstanceDetailedMonitoringEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Instance(compliant, 'rInstance', {
      vpc: new Vpc(compliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    }).instance.monitoring = true;

    new AutoScalingGroup(compliant, 'rAsg', {
      vpc: new Vpc(compliant, 'rVpc2'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
      instanceMonitoring: Monitoring.DETAILED,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'EC2InstanceDetailedMonitoringEnabled:'
          ),
        }),
      })
    );
  });

  test('EC2InstanceNoPublicIp: EC2 instances do not have public IPs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnInstance(nonCompliant, 'rInstance', {
      imageId: 'nonCompliantInstance',
      networkInterfaces: [
        {
          associatePublicIpAddress: true,
          deviceIndex: '0',
        },
      ],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstanceNoPublicIp:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnInstance(compliant, 'rInstance1', {
      imageId: 'compliantInstance',
      networkInterfaces: [
        {
          associatePublicIpAddress: false,
          deviceIndex: '0',
        },
      ],
    });
    new CfnInstance(compliant, 'rInstance2', {
      imageId: 'compliantInstance',
      networkInterfaces: [],
    });
    new Instance(compliant, 'rInstance3', {
      vpc: new Vpc(compliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstanceNoPublicIp:'),
        }),
      })
    );
  });

  test('EC2InstanceProfileAttached: EC2 instances have an instance profile attached', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnInstance(nonCompliant, 'rInstance');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstanceProfileAttached:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Instance(compliant, 'rInstance', {
      vpc: new Vpc(compliant, 'rVpc'),
      instanceType: InstanceType.of(InstanceClass.C3, InstanceSize.XLARGE),
      machineImage: MachineImage.latestAmazonLinux(),
    }).addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:ListAllMyBuckets'],
        resources: ['arn:aws:s3:::*'],
      })
    );
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstanceProfileAttached:'),
        }),
      })
    );
  });

  test('EC2InstanceTerminationProtection: EC2 Instances outside of an ASG have Termination Protection enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Instance(nonCompliant, 'rInstance', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstanceTerminationProtection:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const instance = new Instance(compliant, 'rInstance', {
      vpc: new Vpc(compliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    instance.instance.disableApiTermination = true;
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstanceTerminationProtection:'),
        }),
      })
    );
  });

  test('EC2InstancesInVPC: EC2 instances are created within VPCs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnInstance(nonCompliant, 'rInstance1', {
      imageId: 'nonCompliantInstance',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstancesInVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnInstance(compliant, 'rInstance2', {
      imageId: 'compliantInstance',
      subnetId: 'TestSubnet',
    });
    new Instance(nonCompliant, 'rInstance', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      instanceType: new InstanceType(InstanceClass.T3),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2InstancesInVPC:'),
        }),
      })
    );
  });

  test('EC2RestrictedCommonPorts: EC2 instances have all common TCP ports restricted for ingress IPv4 traffic', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnSecurityGroup(nonCompliant, 'rSecurityGroup', {
      groupDescription: 'security group tcp port 20 open',
      securityGroupIngress: [
        {
          fromPort: 20,
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedCommonPorts:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnSecurityGroup(nonCompliant2, 'rSecurityGroup', {
      groupDescription: 'security group with SSH unrestricted',
      securityGroupIngress: [
        {
          fromPort: 21,
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedCommonPorts:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new SecurityGroup(nonCompliant3, 'rSg', {
      vpc: new Vpc(nonCompliant3, 'rVpc'),
    }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedCommonPorts:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnSecurityGroup(nonCompliant4, 'rSecurityGroup', {
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
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedCommonPorts:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnSecurityGroup(compliant, 'rSecurityGroup1', {
      groupDescription: 'security group with no rules',
      securityGroupIngress: [],
    });
    new CfnSecurityGroup(compliant, 'rSecurityGroup2', {
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
    new CfnSecurityGroup(compliant, 'rSecurityGroup3', {
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
    new CfnSecurityGroup(compliant, 'rSecurityGroup4', {
      groupDescription: 'security group allowing unrestricted udp traffic',
      securityGroupIngress: [
        {
          fromPort: 21,
          ipProtocol: 'udp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedCommonPorts:'),
        }),
      })
    );
  });

  test('EC2RestrictedInbound: EC2 security groups do not allow for 0.0.0.0/0 or ::/0 inbound access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new SecurityGroup(nonCompliant, 'rSg', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
    }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedInbound:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnSecurityGroupIngress(nonCompliant2, 'rIngress', {
      ipProtocol: 'tcp',
      cidrIp: '0.0.0.0/0',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedInbound:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnSecurityGroupIngress(nonCompliant3, 'rIngress', {
      ipProtocol: 'tcp',
      cidrIpv6: 'ff:ff:ff:ff:ff:ff:ff:ff/0',
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedInbound:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new SecurityGroup(nonCompliant4, 'rSg', {
      vpc: new Vpc(nonCompliant4, 'rVpc'),
    }).addIngressRule(Peer.anyIpv6(), Port.allTraffic());
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedInbound:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new SecurityGroup(compliant, 'rSg', {
      vpc: new Vpc(compliant, 'rVpc'),
    }).addIngressRule(Peer.ipv4('1.2.3.4/32'), Port.allTraffic());

    new CfnSecurityGroupIngress(compliant, 'rIngress', {
      ipProtocol: 'tcp',
      cidrIp: '1.2.3.4/32',
    });
    new CfnSecurityGroupIngress(compliant, 'rIngress2', {
      ipProtocol: 'tcp',
      cidrIpv6: '1234:5678:9abc:def1:2345:6789:abcd:ef12/128',
    });
    new SecurityGroup(compliant, 'rSg2', {
      vpc: new Vpc(compliant, 'rVpc2'),
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedInbound:'),
        }),
      })
    );
  });

  test('EC2RestrictedSSH: Security Groups do not allow for unrestricted SSH traffic', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnSecurityGroup(nonCompliant, 'rSecurityGroup', {
      groupDescription: 'security group with SSH unrestricted',
      securityGroupIngress: [
        {
          fromPort: 22,
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
        },
      ],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnSecurityGroup(nonCompliant2, 'rSecurityGroup', {
      groupDescription: 'security group with SSH unrestricted',
      securityGroupIngress: [
        {
          fromPort: 22,
          ipProtocol: 'tcp',
          cidrIpv6: '::/0',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new SecurityGroup(nonCompliant3, 'rSg', {
      vpc: new Vpc(nonCompliant3, 'rVpc'),
    }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnSecurityGroup(nonCompliant4, 'rSecurityGroup', {
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
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new TestPack());
    new CfnSecurityGroupIngress(nonCompliant5, 'rSgIngress', {
      fromPort: 1,
      toPort: 10000,
      ipProtocol: 'tcp',
      cidrIp: '1.0.0.0/0',
    });
    const messages5 = SynthUtils.synthesize(nonCompliant5).messages;
    expect(messages5).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedSSH:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnSecurityGroup(compliant, 'rSecurityGroup1', {
      groupDescription: 'security group with no rules',
      securityGroupIngress: [],
    });
    new CfnSecurityGroup(compliant, 'rSecurityGroup2', {
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
    new CfnSecurityGroup(compliant, 'rSecurityGroup3', {
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
    const messages6 = SynthUtils.synthesize(compliant).messages;
    expect(messages6).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2RestrictedSSH:'),
        }),
      })
    );
  });

  test('EC2SecurityGroupDescription: Security Groups have descriptions', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new SecurityGroup(nonCompliant, 'rSg', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      description: ' ',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2SecurityGroupDescription:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new SecurityGroup(compliant, 'rSg', {
      vpc: new Vpc(compliant, 'rVpc'),
      description: 'lorem ipsum dolor sit amet',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2SecurityGroupDescription:'),
        }),
      })
    );
  });
});

describe('Amazon Elastic Block Store (EBS)', () => {
  test('EC2EBSVolumeEncrypted: EBS volumes have encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Volume(nonCompliant, 'rVolume', {
      availabilityZone: nonCompliant.availabilityZones[0],
      size: Size.gibibytes(42),
      encrypted: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2EBSVolumeEncrypted:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Volume(compliant, 'rVolume', {
      availabilityZone: compliant.availabilityZones[0],
      size: Size.gibibytes(42),
      encrypted: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EC2EBSVolumeEncrypted:'),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
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
} from '@aws-cdk/aws-ec2';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Elastic Compute Cloud (Amazon EC2)', () => {
  test('NIST.800.53.R5-EC2EBSOptimizedInstance: - EC2 instance types that support EBS optimization and are not EBS optimized by default have EBS optimization enabled - (Control IDs: CP-2(5), CP-9a, CP-9b, CP-9c, CP-10, SC-5(2))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Instance(nonCompliant, 'rInstance', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      instanceType: InstanceType.of(InstanceClass.C3, InstanceSize.XLARGE),
      machineImage: MachineImage.latestAmazonLinux(),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2EBSOptimizedInstance:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2EBSOptimizedInstance:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-EC2InstanceNoPublicIp: - EC2 instances do not have public IPs - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2InstanceNoPublicIp:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2InstanceNoPublicIp:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-EC2InstanceProfileAttached: - EC2 instances have an instance profile attached - (Control IDs: AC-3, CM-5(1)(a), CM-6a)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnInstance(nonCompliant, 'rInstance');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2InstanceProfileAttached:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2InstanceProfileAttached:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-EC2InstancesInVPC: - EC2 instances are created within VPCs - (Control IDs: AC-2(6), AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnInstance(nonCompliant, 'rInstance1', {
      imageId: 'nonCompliantInstance',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-EC2InstancesInVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EC2InstancesInVPC:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-EC2RestrictedCommonPorts: - EC2 instances have all common TCP ports restricted for ingress IPv4 traffic - (Control IDs: AC-4(21), AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-2a, CM-2(2), CM-6a, CM-7b, CM-8(6), CM-9b, SC-7a, SC-7c, SC-7(5), SC-7(7), SC-7(11), SC-7(12), SC-7(16), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    new SecurityGroup(nonCompliant3, 'rSg', {
      vpc: new Vpc(nonCompliant3, 'rVpc'),
    }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining(
            'NIST.800.53.R5-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-EC2RestrictedSSH: - Security Groups do not allow for unrestricted SSH traffic - (Control IDs: AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-9b, SC-7a, SC-7c, SC-7(7), SC-7(11), SC-7(12), SC-7(16), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    new SecurityGroup(nonCompliant3, 'rSg', {
      vpc: new Vpc(nonCompliant3, 'rVpc'),
    }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EC2RestrictedSSH:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EC2RestrictedSSH:'),
        }),
      })
    );
  });
});

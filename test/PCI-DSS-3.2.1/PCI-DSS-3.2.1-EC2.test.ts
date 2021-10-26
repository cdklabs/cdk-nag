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
import { PCIDSS321Checks } from '../../src';

describe('Amazon Elastic Compute Cloud (Amazon EC2)', () => {
  test('PCI.DSS.321-EC2InstanceNoPublicIp: - EC2 instances do not have public IPs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2InstanceNoPublicIp:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2InstanceNoPublicIp:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-EC2InstanceProfileAttached: - EC2 instances have an instance profile attached - (Control IDs: 2.2, 7.1.1, 7.2.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnInstance(nonCompliant, 'rInstance');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-EC2InstanceProfileAttached:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-EC2InstanceProfileAttached:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-EC2InstancesInVPC: - EC2 instances are created within VPCs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnInstance(nonCompliant, 'rInstance1', {
      imageId: 'nonCompliantInstance',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-EC2InstancesInVPC:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2InstancesInVPC:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-EC2RestrictedCommonPorts: - EC2 instances have all common TCP ports restricted for ingress IPv4 traffic - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.2, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
    new SecurityGroup(nonCompliant3, 'rSg', {
      vpc: new Vpc(nonCompliant3, 'rVpc'),
    }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-EC2RestrictedCommonPorts:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-EC2RestrictedSSH: - Security Groups do not allow for unrestricted SSH traffic - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.2, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
    new SecurityGroup(nonCompliant3, 'rSg', {
      vpc: new Vpc(nonCompliant3, 'rVpc'),
    }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2RestrictedSSH:'),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2RestrictedSSH:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-EC2RestrictedSSH:'),
        }),
      })
    );
  });
});

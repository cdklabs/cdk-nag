/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { AutoScalingGroup, Monitoring } from '@aws-cdk/aws-autoscaling';
import {
  Instance,
  InstanceClass,
  InstanceType,
  MachineImage,
  Vpc,
  CfnInstance,
  CfnSecurityGroup,
  SecurityGroup,
  Peer,
  Port,
  CfnSecurityGroupIngress,
} from '@aws-cdk/aws-ec2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';


describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon Elastic Compute Cloud (Amazon EC2)', () => {

    //Test whether common ports are restricted
    test('nist80053EC2CheckCommonPortsRestricted: - EC2 instances restrict common ports - (Control IDs: AC-4, CM-2, SC-7, SC-7(3))', () => {
      //Expect a POSITIVE response because the security group allows connections from port 20
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnSecurityGroup(positive, 'rSecurityGroup', {
        groupDescription: 'security group tcp port 20 open',
        securityGroupIngress: [
          {
            fromPort: 20,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckCommonPortsRestricted:'),
          }),
        }),
      );

      //Expect a POSITIVE response because the security group allows connections from port 21
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnSecurityGroup(positive2, 'rSecurityGroup', {
        groupDescription: 'security group with SSH unrestricted',
        securityGroupIngress: [
          {
            fromPort: 21,
            ipProtocol: 'tcp',
            cidrIpv6: '::/0',
          },
        ],
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckCommonPortsRestricted:'),
          }),
        }),
      );

      //Expect a POSITIVE response because the security group allows connections from all ports
      const positive3 = new Stack();
      Aspects.of(positive3).add(new NIST80053Checks());

      new SecurityGroup(positive3, 'rSg', {
        vpc: new Vpc(positive3, 'rVpc'),
      }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());

      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckCommonPortsRestricted:'),
          }),
        }),
      );

      //Expect a POSITIVE response because the security group allows port 21 by specifying an IP range including port 21
      const positive4 = new Stack();
      Aspects.of(positive4).add(new NIST80053Checks());
      new CfnSecurityGroup(positive4, 'rSecurityGroup', {
        groupDescription: 'security group with port 21 open',
        securityGroupIngress: [
          {
            fromPort: 1,
            toPort: 10000,
            ipProtocol: 'tcp',
            cidrIpv6: '::/0',
          },
        ],
      });
      const messages4 = SynthUtils.synthesize(positive4).messages;
      expect(messages4).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckCommonPortsRestricted:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because the security group has no rules
      new CfnSecurityGroup(negative, 'rSecurityGroup1', {
        groupDescription: 'security group with no rules',
        securityGroupIngress: [],
      });

      //Expect a NEGATIVE response because port 21 is enabled for a specific IP address
      new CfnSecurityGroup(negative, 'rSecurityGroup2', {
        groupDescription: 'security group with SSH ingress allowed for a specific IP address',
        securityGroupIngress: [
          {
            fromPort: 21,
            ipProtocol: 'tcp',
            cidrIp: '72.21.210.165',
          },
        ],
      });

      //Expect a NEGATIVE response because port 80 (not a restricted port) is open to the world
      new CfnSecurityGroup(negative, 'rSecurityGroup3', {
        groupDescription: 'security group with an open-world ingress rule for HTTP traffic',
        securityGroupIngress: [
          {
            fromPort: 80,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });

      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckCommonPortsRestricted:'),
          }),
        }),
      );
    });

    //Test whether Security Groups restrict SSH access
    test('nist80053EC2CheckSSHR‎estricted: - Security Groups do not allow for unrestricted SSH traffic - (Control IDs: AC-4, SC-7, SC-7(3))', () => {
      //Expect a POSITIVE response because the security group allows SSH connections from any IPv4 address
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnSecurityGroup(positive, 'rSecurityGroup', {
        groupDescription: 'security group with SSH unrestricted',
        securityGroupIngress: [
          {
            fromPort: 22,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckSSHRestricted:'),
          }),
        }),
      );

      //Expect a POSITIVE response because the security group allows SSH connections from any IPv6 address
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnSecurityGroup(positive2, 'rSecurityGroup', {
        groupDescription: 'security group with SSH unrestricted',
        securityGroupIngress: [
          {
            fromPort: 22,
            ipProtocol: 'tcp',
            cidrIpv6: '::/0',
          },
        ],
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckSSHRestricted:'),
          }),
        }),
      );

      //Expect a POSITIVE response because the security group allows connections from any IPv4 address from any port
      const positive3 = new Stack();
      Aspects.of(positive3).add(new NIST80053Checks());

      new SecurityGroup(positive3, 'rSg', {
        vpc: new Vpc(positive3, 'rVpc'),
      }).addIngressRule(Peer.anyIpv4(), Port.allTraffic());

      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckSSHRestricted:'),
          }),
        }),
      );

      //Expect a POSITIVE response because the security group allows SSH by specifying an IP range including port 22
      const positive4 = new Stack();
      Aspects.of(positive4).add(new NIST80053Checks());
      new CfnSecurityGroup(positive4, 'rSecurityGroup', {
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
      const messages4 = SynthUtils.synthesize(positive4).messages;
      expect(messages4).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckSSHRestricted:'),
          }),
        }),
      );

      //Expect a POSITIVE response because the security group ingress allows SSH by specifying an IP range including port 22
      const positive5 = new Stack();
      Aspects.of(positive5).add(new NIST80053Checks());
      new CfnSecurityGroupIngress(positive5, 'rSgIngress', {
        fromPort: 1,
        toPort: 10000,
        ipProtocol: 'tcp',
        cidrIp: '1.0.0.0/0',
      });
      const messages5 = SynthUtils.synthesize(positive5).messages;
      expect(messages5).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckSSHRestricted:'),
          }),
        }),
      );

      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because the security group has no rules
      new CfnSecurityGroup(negative, 'rSecurityGroup1', {
        groupDescription: 'security group with no rules',
        securityGroupIngress: [],
      });

      //Expect a NEGATIVE response because SSH is enabled for a specific IP address
      new CfnSecurityGroup(negative, 'rSecurityGroup2', {
        groupDescription: 'security group with SSH ingress allowed for a specific IP address',
        securityGroupIngress: [
          {
            fromPort: 22,
            ipProtocol: 'tcp',
            cidrIp: '72.21.210.165',
          },
        ],
      });

      //Expect a NEGATIVE response because port 80 (not 22) is open to the world
      new CfnSecurityGroup(negative, 'rSecurityGroup3', {
        groupDescription: 'security group with an open-world ingress rule for HTTP traffic',
        securityGroupIngress: [
          {
            fromPort: 80,
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
          },
        ],
      });

      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckSSHRestricted:'),
          }),
        }),
      );
    });

    //Test whether EC2 instances have public IPs
    test('nist80053EC2CheckNoPublicIPs: - EC2 instances do not have public IPs - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3))', () => {
      //Expect a POSITIVE response because the instance has a public IP
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnInstance(positive, 'rInstance', {
        imageId: 'PositiveInstance',
        networkInterfaces: [
          {
            associatePublicIpAddress: true,
            deviceIndex: '0',
          },
        ],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckNoPublicIPs:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because the machine has a network interface configured WITHOUT a public IP association
      new CfnInstance(negative, 'rInstance1', {
        imageId: 'NegativeInstance',
        networkInterfaces: [
          {
            associatePublicIpAddress: false,
            deviceIndex: '0',
          },
        ],
      });

      //Expect a NEGATIVE response because the machine does not have any network interfaces configured
      new CfnInstance(negative, 'rInstance2', {
        imageId: 'NegativeInstance',
        networkInterfaces: [
        ],
      });

      //Expect a NEGATIVE response because the machine does not have a public IP
      new Instance(negative, 'rInstance3', {
        vpc: new Vpc(negative, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });

      //Check cdk-nag response
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckNoPublicIPs:'),
          }),
        }),
      );
    });

    //Test whether EC2 instances dare created within VPCs
    test('nist80053EC2CheckInsideVPC: - EC2 instances are created within VPCs - (Control IDs: AC-4, SC-7, SC-7(3))', () => {
      //Expect a POSITIVE response because the instance is not defined inside of a VPC (subnet)
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnInstance(positive, 'rInstance1', {
        imageId: 'PositiveInstance',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckInsideVPC:'),
          }),
        }),
      );

      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because the machine is inside of a VPC (subnet)
      new CfnInstance(negative, 'rInstance2', {
        imageId: 'NegativeInstance',
        subnetId: 'TestSubnet',
      });

      //Expect a NEGATIVE response because the machine is inside of a VPC (subnet)
      new Instance(positive, 'rInstance', {
        vpc: new Vpc(positive, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });

      //Check cdk-nag response
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckInsideVPC:'),
          }),
        }),
      );
    });

    //Test whether detailed monitoring is enabled
    test('nist80053EC2CheckDetailedMonitoring: - EC2 instances have detailed monitoring enabled - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).', () => {
      //Expect a POSITIVE response because the instance does not have detailed monitoring enabled
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new Instance(positive, 'rInstance', {
        vpc: new Vpc(positive, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-EC2CheckDetailedMonitoring:'),
          }),
        }),
      );

      //Expect a POSITIVE response because instances in the ASG do not have detailed monitoring enabled
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
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
            data: expect.stringContaining('NIST.800.53-EC2CheckDetailedMonitoring:'),
          }),
        }),
      );

      //Expect a NEGATIVE response because the instance has detailed monitoring enabled
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new Instance(negative, 'rInstance', {
        vpc: new Vpc(negative, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      }).instance.monitoring = true;

      //Expect a NEGATIVE response because instances in the ASG have detailed monitoring enabled
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
            data: expect.stringContaining('NIST.800.53-EC2CheckDetailedMonitoring:'),
          }),
        }),
      );
    });
  });
});

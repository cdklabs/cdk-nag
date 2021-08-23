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
} from '@aws-cdk/aws-ec2';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('HIPAA.Security Compute Checks', () => {
  describe('Amazon Elastic Compute Cloud (Amazon EC2)', () => {
    //Test whether detailed monitoring is enabled
    test('hipaaSecurityEC2InstanceDetailedMonitoringEnabled: - EC2 instances have detailed monitoring enabled - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).', () => {
      //Expect a POSITIVE response because the instance does not have detailed monitoring enabled
      const positive = new Stack();
      Aspects.of(positive).add(new HIPAASecurityChecks());
      new Instance(positive, 'rInstance', {
        vpc: new Vpc(positive, 'rVpc'),
        instanceType: new InstanceType(InstanceClass.T3),
        machineImage: MachineImage.latestAmazonLinux(),
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'HIPAA.Security-C2InstanceDetailedMonitoringEnabled:'
            ),
          }),
        })
      );

      //Expect a POSITIVE response because instances in the ASG do not have detailed monitoring enabled
      const positive2 = new Stack();
      Aspects.of(positive2).add(new HIPAASecurityChecks());
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
            data: expect.stringContaining(
              'HIPAA.Security-C2InstanceDetailedMonitoringEnabled:'
            ),
          }),
        })
      );

      //Expect a NEGATIVE response because the instance has detailed monitoring enabled
      const negative = new Stack();
      Aspects.of(negative).add(new HIPAASecurityChecks());
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
            data: expect.stringContaining(
              'HIPAA.Security-C2InstanceDetailedMonitoringEnabled:'
            ),
          }),
        })
      );
    });

    //Test whether EC2 instances have public IPs
    test('hipaaSecurityEC2InstanceNoPublicIp: - EC2 instances do not have public IPs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
      //Expect a POSITIVE response because the instance has a public IP
      const positive = new Stack();
      Aspects.of(positive).add(new HIPAASecurityChecks());
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
            data: expect.stringContaining(
              'HIPAA.Security-EC2CheckNoPublicIPs:'
            ),
          }),
        })
      );

      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new HIPAASecurityChecks());

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
        networkInterfaces: [],
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
            data: expect.stringContaining(
              'HIPAA.Security-EC2CheckNoPublicIPs:'
            ),
          }),
        })
      );
    });

    //Test whether EC2 instances are created within VPCs
    test('hipaaSecurityEC2InstancesInVPC: - EC2 instances are created within VPCs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
      //Expect a POSITIVE response because the instance is not defined inside of a VPC (subnet)
      const positive = new Stack();
      Aspects.of(positive).add(new HIPAASecurityChecks());
      new CfnInstance(positive, 'rInstance1', {
        imageId: 'PositiveInstance',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('HIPAA.Security-EC2InstancesInVPC:'),
          }),
        })
      );

      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new HIPAASecurityChecks());

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
            data: expect.stringContaining('HIPAA.Security-EC2InstancesInVPC:'),
          }),
        })
      );
    });
  });
});

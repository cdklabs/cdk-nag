/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnVPC, CfnRoute, CfnSubnet, Subnet } from '@aws-cdk/aws-ec2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Virtual Private Cloud (VPC)', () => {
  test('NIST.800.53.R5-VPCDefaultSecurityGroupClosed: - VPCs have their default security group closed - (Control IDs: AC-4(21), AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-6a, CM-9b, SC-7a, SC-7c, SC-7(5), SC-7(7), SC-7(11), SC-7(12), SC-7(16), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnVPC(nonCompliant, 'rVPC', {
      cidrBlock: '1.1.1.1',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );
  });

  test("NIST.800.53.R5-VPCNoUnrestrictedRouteToIGW: - Route tables do not have unrestricted routes ('0.0.0.0/0' or '::/0') to IGWs - (Control IDs: AC-4(21), CM-7b)", () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnRoute(nonCompliant, 'rRoute', {
      routeTableId: 'foo',
      gatewayId: 'igw-bar',
      destinationCidrBlock: '42.42.42.42/0',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnRoute(nonCompliant2, 'rRoute', {
      routeTableId: 'foo',
      gatewayId: 'igw-bar',
      destinationIpv6CidrBlock: 'ff:ff:ff:ff:ff:ff:ff:ff/0',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnRoute(compliant, 'rRoute', {
      routeTableId: 'foo',
      natGatewayId: 'nat-foo',
      destinationCidrBlock: '42.42.42.42/0',
    });
    new CfnRoute(compliant, 'rRoute2', {
      routeTableId: 'foo',
      gatewayId: 'igw-bar',
      destinationCidrBlock: '42.42.42.42/32',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-VPCSubnetAutoAssignPublicIpDisabled: - Subnets do not auto-assign public IP addresses - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Subnet(nonCompliant, 'rSubnet', {
      availabilityZone: 'foo',
      vpcId: 'bar',
      cidrBlock: 'baz',
      mapPublicIpOnLaunch: true,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnSubnet(nonCompliant2, 'rSubnet', {
      availabilityZone: 'foo',
      vpcId: 'bar',
      cidrBlock: 'baz',
      assignIpv6AddressOnCreation: true,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Subnet(compliant, 'rSubnet', {
      availabilityZone: 'foo',
      vpcId: 'bar',
      cidrBlock: 'baz',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );
  });
});

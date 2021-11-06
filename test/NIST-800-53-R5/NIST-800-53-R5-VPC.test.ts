/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import {
  CfnVPC,
  CfnRoute,
  CfnSubnet,
  Subnet,
  CfnFlowLog,
  FlowLog,
  Vpc,
  FlowLogResourceType,
  FlowLogTrafficType,
} from '@aws-cdk/aws-ec2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Virtual Private Cloud (VPC)', () => {
  test('NIST.800.53.R5-VPCDefaultSecurityGroupClosed: - VPCs have their default security group closed - (Control IDs: AC-4(26), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), CM-6a, CM-9b, IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SI-4(17), SI-7(8))', () => {
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

  test('NIST.800.53.R5-VPCFlowLogsEnabled: - VPCs have Flow Logs enabled - (Control IDs: AC-4(26), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), CM-6a, CM-9b, IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SI-4(17), SI-7(8))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Vpc(nonCompliant, 'rVpc');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new Vpc(nonCompliant2, 'rVpc');
    new FlowLog(nonCompliant2, 'rFlowLog', {
      resourceType: FlowLogResourceType.fromVpc(
        Vpc.fromVpcAttributes(nonCompliant2, 'rLookupVpc', {
          vpcId: 'foo',
          availabilityZones: ['us-east-1a'],
        })
      ),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const compliantVpc = new Vpc(compliant, 'rVpc1');
    new FlowLog(compliant, 'rFlowFlog1', {
      resourceType: FlowLogResourceType.fromVpc(compliantVpc),
    });
    const compliantVpc2 = new Vpc(compliant, 'rVpc2');
    new CfnFlowLog(compliant, 'rCfnFlowLog', {
      resourceId: compliantVpc2.vpcId,
      resourceType: 'VPC',
      trafficType: FlowLogTrafficType.ALL,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-VPCFlowLogsEnabled:'),
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

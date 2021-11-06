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
  Vpc,
  FlowLog,
  FlowLogResourceType,
  CfnFlowLog,
  FlowLogTrafficType,
} from '@aws-cdk/aws-ec2';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon Virtual Private Cloud (VPC)', () => {
  test('PCI.DSS.321-VPCDefaultSecurityGroupClosed: - VPCs have their default security group closed - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.1, 2.2, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnVPC(nonCompliant, 'rVPC', {
      cidrBlock: '1.1.1.1',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-VPCFlowLogsEnabled: - VPCs have Flow Logs enabled - (Control IDs: 2.2, 10.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new Vpc(nonCompliant, 'rVpc');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-VPCFlowLogsEnabled:'),
        }),
      })
    );
  });

  test("PCI.DSS.321-VPCNoUnrestrictedRouteToIGW: - Route tables do not have unrestricted routes ('0.0.0.0/0' or '::/0') to IGWs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.2.2)", () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-VPCSubnetAutoAssignPublicIpDisabled: - Subnets do not auto-assign public IP addresses - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );
  });
});

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
import { HIPAASecurityChecks } from '../../src';

describe('Amazon Virtual Private Cloud (VPC)', () => {
  test('HIPAA.Security-VPCDefaultSecurityGroupClosed: - VPCs have their default security group closed - (Control ID: 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnVPC(nonCompliant, 'rVPC', {
      cidrBlock: '1.1.1.1',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-VPCFlowLogsEnabled: - VPCs have Flow Logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Vpc(nonCompliant, 'rVpc');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-VPCFlowLogsEnabled:'),
        }),
      })
    );
  });

  test("HIPAA.Security-VPCNoUnrestrictedRouteToIGW: - Route tables do not have unrestricted routes ('0.0.0.0/0' or '::/0') to IGWs - (Control ID: 164.312(e)(1))", () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-VPCNoUnrestrictedRouteToIGW:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled: - Subnets do not auto-assign public IP addresses - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled:'
          ),
        }),
      })
    );
  });
});

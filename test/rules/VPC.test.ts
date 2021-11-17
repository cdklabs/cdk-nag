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
  NetworkAcl,
} from '@aws-cdk/aws-ec2';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  VPCDefaultSecurityGroupClosed,
  VPCFlowLogsEnabled,
  VPCNoNACLs,
  VPCNoUnrestrictedRouteToIGW,
  VPCSubnetAutoAssignPublicIpDisabled,
} from '../../src/rules/vpc';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        VPCDefaultSecurityGroupClosed,
        VPCFlowLogsEnabled,
        VPCNoNACLs,
        VPCNoUnrestrictedRouteToIGW,
        VPCSubnetAutoAssignPublicIpDisabled,
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

describe('Amazon Virtual Private Cloud (VPC)', () => {
  test('VPCDefaultSecurityGroupClosed: VPCs have their default security group closed', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnVPC(nonCompliant, 'rVPC', {
      cidrBlock: '1.1.1.1',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCDefaultSecurityGroupClosed:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCDefaultSecurityGroupClosed:'),
        }),
      })
    );
  });

  test('VPCFlowLogsEnabled: VPCs have Flow Logs enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Vpc(nonCompliant, 'rVpc');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCFlowLogsEnabled:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('VPCFlowLogsEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('VPCFlowLogsEnabled:'),
        }),
      })
    );
  });

  test('VPCNoNACLs: VPCs do not implement network ACLs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new NetworkAcl(nonCompliant, 'rNacl', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCNoNACLs:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new NetworkAcl(nonCompliant2, 'rNacl', {
      vpc: new Vpc(nonCompliant2, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCNoNACLs:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Vpc(compliant, 'rVpc');
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCNoNACLs:'),
        }),
      })
    );
  });

  test("VPCNoUnrestrictedRouteToIGW: Route tables do not have unrestricted routes ('0.0.0.0/0' or '::/0') to IGWs - (Control ID: 164.312(e)(1))", () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnRoute(nonCompliant, 'rRoute', {
      routeTableId: 'foo',
      gatewayId: 'igw-bar',
      destinationCidrBlock: '42.42.42.42/0',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCNoUnrestrictedRouteToIGW:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnRoute(nonCompliant2, 'rRoute', {
      routeTableId: 'foo',
      gatewayId: 'igw-bar',
      destinationIpv6CidrBlock: 'ff:ff:ff:ff:ff:ff:ff:ff/0',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCNoUnrestrictedRouteToIGW:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('VPCNoUnrestrictedRouteToIGW:'),
        }),
      })
    );
  });

  test('VPCSubnetAutoAssignPublicIpDisabled: Subnets do not auto-assign public IP addresses', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('VPCSubnetAutoAssignPublicIpDisabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('VPCSubnetAutoAssignPublicIpDisabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Subnet(compliant, 'rSubnet', {
      availabilityZone: 'foo',
      vpcId: 'bar',
      cidrBlock: 'baz',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('VPCSubnetAutoAssignPublicIpDisabled:'),
        }),
      })
    );
  });
});

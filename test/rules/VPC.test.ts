/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
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
} from 'aws-cdk-lib/aws-ec2';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import {
  VPCDefaultSecurityGroupClosed,
  VPCFlowLogsEnabled,
  VPCNoNACLs,
  VPCNoUnrestrictedRouteToIGW,
  VPCSubnetAutoAssignPublicIpDisabled,
} from '../../src/rules/vpc';
import { TestPack, validateStack, TestType } from './utils';

const testPack = new TestPack([
  VPCDefaultSecurityGroupClosed,
  VPCFlowLogsEnabled,
  VPCNoNACLs,
  VPCNoUnrestrictedRouteToIGW,
  VPCSubnetAutoAssignPublicIpDisabled,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Virtual Private Cloud (VPC)', () => {
  describe('VPCDefaultSecurityGroupClosed: VPCs have their default security group closed', () => {
    const ruleId = 'VPCDefaultSecurityGroupClosed';
    test('Noncompliance 1', () => {
      new CfnVPC(stack, 'rVPC', {
        cidrBlock: '1.1.1.1',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
  });

  describe('VPCFlowLogsEnabled: VPCs have Flow Logs enabled', () => {
    const ruleId = 'VPCFlowLogsEnabled';
    test('Noncompliance 1', () => {
      new Vpc(stack, 'rVpc');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Vpc(stack, 'rVpc');
      new FlowLog(stack, 'rFlowLog', {
        resourceType: FlowLogResourceType.fromVpc(
          Vpc.fromVpcAttributes(stack, 'rLookupVpc', {
            vpcId: 'foo',
            availabilityZones: ['us-east-1a'],
          })
        ),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantVpc = new Vpc(stack, 'rVpc1');
      new FlowLog(stack, 'rFlowFlog1', {
        resourceType: FlowLogResourceType.fromVpc(compliantVpc),
      });
      const compliantVpc2 = new Vpc(stack, 'rVpc2');
      new CfnFlowLog(stack, 'rCfnFlowLog', {
        resourceId: compliantVpc2.vpcId,
        resourceType: 'VPC',
        trafficType: FlowLogTrafficType.ALL,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('VPCNoNACLs: VPCs do not implement network ACLs', () => {
    const ruleId = 'VPCNoNACLs';
    test('Noncompliance 1', () => {
      new NetworkAcl(stack, 'rNacl', {
        vpc: new Vpc(stack, 'rVpc'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new NetworkAcl(stack, 'rNacl', {
        vpc: new Vpc(stack, 'rVpc'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Vpc(stack, 'rVpc');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe("VPCNoUnrestrictedRouteToIGW: Route tables do not have unrestricted routes ('0.0.0.0/0' or '::/0') to IGWs - (Control ID: 164.312(e)(1))", () => {
    const ruleId = 'VPCNoUnrestrictedRouteToIGW';
    test('Noncompliance 1', () => {
      new CfnRoute(stack, 'rRoute', {
        routeTableId: 'foo',
        gatewayId: 'igw-bar',
        destinationCidrBlock: '42.42.42.42/0',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnRoute(stack, 'rRoute', {
        routeTableId: 'foo',
        gatewayId: 'igw-bar',
        destinationIpv6CidrBlock: 'ff:ff:ff:ff:ff:ff:ff:ff/0',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnRoute(stack, 'rRoute', {
        routeTableId: 'foo',
        natGatewayId: 'nat-foo',
        destinationCidrBlock: '42.42.42.42/0',
      });
      new CfnRoute(stack, 'rRoute2', {
        routeTableId: 'foo',
        gatewayId: 'igw-bar',
        destinationCidrBlock: '42.42.42.42/32',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('VPCSubnetAutoAssignPublicIpDisabled: Subnets do not auto-assign public IP addresses', () => {
    const ruleId = 'VPCSubnetAutoAssignPublicIpDisabled';
    test('Noncompliance 1', () => {
      new Subnet(stack, 'rSubnet', {
        availabilityZone: 'foo',
        vpcId: 'bar',
        cidrBlock: 'baz',
        mapPublicIpOnLaunch: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnSubnet(stack, 'rSubnet', {
        availabilityZone: 'foo',
        vpcId: 'bar',
        cidrBlock: 'baz',
        assignIpv6AddressOnCreation: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Subnet(stack, 'rSubnet', {
        availabilityZone: 'foo',
        vpcId: 'bar',
        cidrBlock: 'baz',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

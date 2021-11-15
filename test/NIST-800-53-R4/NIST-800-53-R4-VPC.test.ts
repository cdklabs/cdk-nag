/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import {
  Vpc,
  FlowLog,
  FlowLogResourceType,
  CfnFlowLog,
  FlowLogTrafficType,
  CfnVPC,
} from '@aws-cdk/aws-ec2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon Virtual Private Cloud (VPC)', () => {
  test('NIST.800.53.R4-VPCDefaultSecurityGroupClosed: - Default VPC security group is closed - (Control IDs: AC-4, SC-7, SC-7(3))', () => {
    //Expect a POSITIVE response because we create a VPC within our stack and its default security group will not be closed.
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new CfnVPC(positive, 'rSecurityGroup', {
      cidrBlock: '1.1.1.1',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );

    //Create stack for negative checks
    //Expect a NEGATIVE response because the stack is empty
    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());

    //Check cdk-nag response
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-VPCDefaultSecurityGroupClosed:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53.R4-VPCFlowLogsEnabled: - VPCs have Flow Logs enabled - (Control IDs: AU-2(a)(d), AU-3, AU-12(a)(c))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new Vpc(nonCompliant, 'rVpc');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-VPCFlowLogsEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-VPCFlowLogsEnabled:'),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnWebACL, CfnLoggingConfiguration } from '@aws-cdk/aws-wafv2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('AWS WAF - Web Application Firewall', () => {
  test('NIST.800.53.R5-WAFv2LoggingEnabled: - WAFv2 web ACLs have logging enabled - (Control IDs: AC-4(26), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-4(17), SI-7(8)).', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnWebACL(nonCompliant, 'rWebACL', {
      defaultAction: {
        allow: {
          customRequestHandling: {
            insertHeaders: [
              {
                name: 'AllowActionHeader1Name',
                value: 'AllowActionHeader1Value',
              },
            ],
          },
        },
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'foo',
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-WAFv2LoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const compliantWebAcl1 = new CfnWebACL(compliant, 'rWebACL', {
      defaultAction: {
        allow: {
          customRequestHandling: {
            insertHeaders: [
              {
                name: 'AllowActionHeader1Name',
                value: 'AllowActionHeader1Value',
              },
            ],
          },
        },
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'foo',
      },
    });
    new CfnLoggingConfiguration(compliant, 'rLoggingConfig1', {
      resourceArn: compliantWebAcl1.attrArn,
      logDestinationConfigs: [],
    });
    const compliantWebAcl2 = new CfnWebACL(compliant, 'rWebACL2', {
      name: 'foo',
      defaultAction: {
        allow: {
          customRequestHandling: {
            insertHeaders: [
              {
                name: 'AllowActionHeader1Name',
                value: 'AllowActionHeader1Value',
              },
            ],
          },
        },
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'foo',
      },
    });
    new CfnLoggingConfiguration(compliant, 'rLoggingConfig2', {
      resourceArn: `arn:aws:wafv2:us-east-1:123456789000:regional/webacl/${compliantWebAcl2.name}`,
      logDestinationConfigs: [],
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-WAFv2LoggingEnabled:'),
        }),
      })
    );
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnWebACL, CfnLoggingConfiguration } from '@aws-cdk/aws-wafv2';
import { Aspects, Stack } from '@aws-cdk/core';
import { WAFv2LoggingEnabled } from '../../src/rules/waf';
import { TestPack, TestType, validateStack } from './utils';

const testPack = new TestPack([WAFv2LoggingEnabled]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS WAF - Web Application Firewall', () => {
  describe('WAFv2LoggingEnabled: WAFv2 web ACLs have logging enabled', () => {
    const ruleId = 'WAFv2LoggingEnabled';
    test('Noncompliance 1', () => {
      new CfnWebACL(stack, 'rWebACL', {
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      const compliantWebAcl1 = new CfnWebACL(stack, 'rWebACL', {
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
      new CfnLoggingConfiguration(stack, 'rLoggingConfig1', {
        resourceArn: compliantWebAcl1.attrArn,
        logDestinationConfigs: [],
      });
      const compliantWebAcl2 = new CfnWebACL(stack, 'rWebACL2', {
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
      new CfnLoggingConfiguration(stack, 'rLoggingConfig2', {
        resourceArn: `arn:aws:wafv2:us-east-1:123456789000:regional/webacl/${compliantWebAcl2.name}`,
        logDestinationConfigs: [],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

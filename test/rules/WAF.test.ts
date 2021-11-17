/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnWebACL, CfnLoggingConfiguration } from '@aws-cdk/aws-wafv2';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { WAFv2LoggingEnabled } from '../../src/rules/waf';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [WAFv2LoggingEnabled];
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

describe('AWS WAF - Web Application Firewall', () => {
  test('WAFv2LoggingEnabled: WAFv2 web ACLs have logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('WAFv2LoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('WAFv2LoggingEnabled:'),
        }),
      })
    );
  });
});

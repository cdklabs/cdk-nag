/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { AthenaWorkgroupEncryptedQueryResults } from '../../src/rules/athena';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [AthenaWorkgroupEncryptedQueryResults];
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

describe('Amazon Athena', () => {
  test('AthenaWorkgroupEncryptedQueryResults: Athena workgroups encrypt query results', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnWorkGroup(nonCompliant, 'rWorkgroup', {
      name: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnWorkGroup(nonCompliant2, 'rWorkgroup', {
      name: 'foo',
      workGroupConfiguration: {
        enforceWorkGroupConfiguration: false,
        resultConfiguration: {
          encryptionConfiguration: {
            encryptionOption: 'SSE_S3',
          },
        },
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );
    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnWorkGroup(nonCompliant3, 'rWorkgroup', {
      name: 'foo',
      workGroupConfiguration: {
        enforceWorkGroupConfiguration: true,
        requesterPaysEnabled: true,
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );
    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnWorkGroup(nonCompliant4, 'rWorkgroup', {
      name: 'foo',
      workGroupConfiguration: {
        enforceWorkGroupConfiguration: true,
        resultConfiguration: {
          outputLocation: 'bar',
        },
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );
    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new TestPack());
    new CfnWorkGroup(nonCompliant5, 'rWorkgroup', {
      name: 'foo',
      workGroupConfigurationUpdates: {
        enforceWorkGroupConfiguration: false,
        resultConfigurationUpdates: {
          removeEncryptionConfiguration: true,
        },
      },
    });
    const messages5 = SynthUtils.synthesize(nonCompliant5).messages;
    expect(messages5).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );

    const nonCompliant6 = new Stack();
    Aspects.of(nonCompliant6).add(new TestPack());
    new CfnWorkGroup(nonCompliant6, 'rWorkgroup', {
      name: 'foo',
      workGroupConfigurationUpdates: {
        enforceWorkGroupConfiguration: true,
        resultConfigurationUpdates: {
          removeEncryptionConfiguration: true,
        },
      },
    });
    const messages6 = SynthUtils.synthesize(nonCompliant6).messages;
    expect(messages6).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );

    const nonCompliant7 = new Stack();
    Aspects.of(nonCompliant7).add(new TestPack());
    new CfnWorkGroup(nonCompliant7, 'rWorkgroup', {
      name: 'foo',
      workGroupConfigurationUpdates: {
        resultConfigurationUpdates: {
          encryptionConfiguration: {
            encryptionOption: 'SSE_S3',
          },
        },
      },
    });
    const messages7 = SynthUtils.synthesize(nonCompliant7).messages;
    expect(messages7).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnWorkGroup(compliant, 'rWorkgroup', {
      name: 'foo',
      workGroupConfiguration: {
        enforceWorkGroupConfiguration: true,
        resultConfiguration: {
          encryptionConfiguration: {
            encryptionOption: 'SSE_S3',
          },
        },
      },
    });
    new CfnWorkGroup(compliant, 'rWorkgroup2', {
      name: 'foo',
      workGroupConfigurationUpdates: {
        enforceWorkGroupConfiguration: true,
        resultConfigurationUpdates: {
          encryptionConfiguration: {
            encryptionOption: 'SSE_S3',
          },
        },
      },
    });
    new CfnWorkGroup(compliant, 'rWorkgroup3', {
      name: 'foo',
      workGroupConfigurationUpdates: {
        requesterPaysEnabled: true,
      },
    });
    new CfnWorkGroup(compliant, 'rWorkgroup4', {
      name: 'foo',
      workGroupConfigurationUpdates: {
        enforceWorkGroupConfiguration: true,
        requesterPaysEnabled: true,
      },
    });
    const messages8 = SynthUtils.synthesize(compliant).messages;
    expect(messages8).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'AthenaWorkgroupEncryptedQueryResults:'
          ),
        }),
      })
    );
  });
});

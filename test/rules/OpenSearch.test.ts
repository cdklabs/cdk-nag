/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import {
  CfnDomain as LegacyCfnDomain,
  Domain as LegacyDomain,
  ElasticsearchVersion,
} from 'aws-cdk-lib/aws-elasticsearch';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  Role,
  AccountRootPrincipal,
  AnyPrincipal,
} from 'aws-cdk-lib/aws-iam';
import {
  CfnDomain,
  Domain,
  EngineVersion,
} from 'aws-cdk-lib/aws-opensearchservice';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  OpenSearchAllowlistedIPs,
  OpenSearchDedicatedMasterNode,
  OpenSearchEncryptedAtRest,
  OpenSearchErrorLogsToCloudWatch,
  OpenSearchInVPCOnly,
  OpenSearchNoUnsignedOrAnonymousAccess,
  OpenSearchNodeToNodeEncryption,
  OpenSearchSlowLogsToCloudWatch,
  OpenSearchZoneAwareness,
} from '../../src/rules/opensearch';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        OpenSearchAllowlistedIPs,
        OpenSearchDedicatedMasterNode,
        OpenSearchEncryptedAtRest,
        OpenSearchErrorLogsToCloudWatch,
        OpenSearchInVPCOnly,
        OpenSearchNoUnsignedOrAnonymousAccess,
        OpenSearchNodeToNodeEncryption,
        OpenSearchSlowLogsToCloudWatch,
        OpenSearchZoneAwareness,
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

describe('Amazon OpenSearch Service', () => {
  test('OpenSearchAllowlistedIPs: OpenSearch Service domains only grant access via allowlisted IP addresses', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {
      elasticsearchVersion: ElasticsearchVersion.V7_10.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(nonCompliant, 'rRole', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
          }),
        ],
      }).toJSON(),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchAllowlistedIPs:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnDomain(nonCompliant2, 'rDomain', {
      engineVersion: EngineVersion.OPENSEARCH_1_0.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(nonCompliant2, 'rRole', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
          }),
        ],
      }).toJSON(),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchAllowlistedIPs:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyCfnDomain(compliant, 'rDomain', {
      elasticsearchVersion: ElasticsearchVersion.V7_10.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(compliant, 'rRole', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
            conditions: {
              IpAddress: {
                'aws:sourceIp': ['42.42.42.42'],
              },
            },
          }),
        ],
      }).toJSON(),
    });
    new CfnDomain(compliant, 'rDomain2', {
      engineVersion: EngineVersion.OPENSEARCH_1_0.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(compliant, 'rRole2', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
            conditions: {
              IpAddress: {
                'aws:sourceIp': ['42.42.42.42'],
              },
            },
          }),
        ],
      }).toJSON(),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchAllowlistedIPs:'),
        }),
      })
    );
  });

  test('OpenSearchDedicatedMasterNode: OpenSearch Service domains use dedicated master nodes', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchDedicatedMasterNode:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchDedicatedMasterNode:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyDomain(compliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      capacity: { masterNodes: 42 },
    });
    new Domain(compliant, 'rDomain2', {
      version: EngineVersion.OPENSEARCH_1_0,
      capacity: { masterNodes: 42 },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchDedicatedMasterNode:'),
        }),
      })
    );
  });

  test('OpenSearchEncryptedAtRest: OpenSearch Service domains have encryption at rest enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchEncryptedAtRest:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchEncryptedAtRest:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      encryptionAtRestOptions: {
        enabled: false,
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchEncryptedAtRest:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnDomain(nonCompliant4, 'rDomain', {
      encryptionAtRestOptions: {
        enabled: false,
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchEncryptedAtRest:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyCfnDomain(compliant, 'rDomain', {
      encryptionAtRestOptions: {
        enabled: true,
      },
    });
    new CfnDomain(compliant, 'rDomain2', {
      encryptionAtRestOptions: {
        enabled: true,
      },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchEncryptedAtRest:'),
        }),
      })
    );
  });

  test('OpenSearchErrorLogsToCloudWatch: OpenSearch Service domains stream error logs to CloudWatch Logs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchErrorLogsToCloudWatch:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchErrorLogsToCloudWatch:'),
        }),
      })
    );
    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new LegacyDomain(nonCompliant3, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchErrorLogsToCloudWatch:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new Domain(nonCompliant4, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchErrorLogsToCloudWatch:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyDomain(compliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { appLogEnabled: true },
    });
    new Domain(compliant, 'rDomain2', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { appLogEnabled: true },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchErrorLogsToCloudWatch:'),
        }),
      })
    );
  });

  test('OpenSearchInVPCOnly: OpenSearch Service domains are within VPCs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnDomain(nonCompliant4, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchInVPCOnly:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyCfnDomain(compliant, 'rDomain', {
      vpcOptions: {
        subnetIds: ['mycoolsubnet'],
      },
    });
    new CfnDomain(compliant, 'rDomain2', {
      vpcOptions: {
        subnetIds: ['mycoolsubnet'],
      },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchInVPCOnly:'),
        }),
      })
    );
  });

  test('OpenSearchNoUnsignedOrAnonymousAccess: OpenSearch Service domains do not allow for unsigned requests or anonymous access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      accessPolicies: [],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'OpenSearchNoUnsignedOrAnonymousAccess:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
      accessPolicies: [],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'OpenSearchNoUnsignedOrAnonymousAccess:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      elasticsearchVersion: ElasticsearchVersion.V7_10.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            resources: ['*'],
          }),
        ],
      }).toJSON(),
    });

    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'OpenSearchNoUnsignedOrAnonymousAccess:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnDomain(nonCompliant4, 'rDomain', {
      engineVersion: EngineVersion.OPENSEARCH_1_0.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            resources: ['*'],
          }),
        ],
      }).toJSON(),
    });

    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'OpenSearchNoUnsignedOrAnonymousAccess:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyCfnDomain(compliant, 'rDomain', {
      elasticsearchVersion: ElasticsearchVersion.V7_10.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(compliant, 'rRole', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
            conditions: {
              IpAddress: {
                'aws:sourceIp': ['42.42.42.42'],
              },
            },
          }),
        ],
      }).toJSON(),
    });
    new CfnDomain(compliant, 'rDomain2', {
      engineVersion: EngineVersion.OPENSEARCH_1_0.version,
      accessPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(compliant, 'rRole2', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
            conditions: {
              IpAddress: {
                'aws:sourceIp': ['42.42.42.42'],
              },
            },
          }),
        ],
      }).toJSON(),
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'OpenSearchNoUnsignedOrAnonymousAccess:'
          ),
        }),
      })
    );
  });

  test('OpenSearchNodeToNodeEncryption: OpenSearch Service domains are node-to-node encrypted', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchNodeToNodeEncryption:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchNodeToNodeEncryption:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      nodeToNodeEncryptionOptions: {
        enabled: false,
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchNodeToNodeEncryption:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnDomain(nonCompliant4, 'rDomain', {
      nodeToNodeEncryptionOptions: {
        enabled: false,
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchNodeToNodeEncryption:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyCfnDomain(compliant, 'rDomain', {
      nodeToNodeEncryptionOptions: {
        enabled: true,
      },
    });
    new CfnDomain(compliant, 'rDomain2', {
      nodeToNodeEncryptionOptions: {
        enabled: true,
      },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchNodeToNodeEncryption:'),
        }),
      })
    );
  });

  test('OpenSearchSlowLogsToCloudWatch: OpenSearch Service domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchSlowLogsToCloudWatch:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchSlowLogsToCloudWatch:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new LegacyDomain(nonCompliant3, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { slowIndexLogEnabled: true },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchSlowLogsToCloudWatch:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new Domain(nonCompliant4, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { slowIndexLogEnabled: true },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchSlowLogsToCloudWatch:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyDomain(compliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    new Domain(compliant, 'rDomain2', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchSlowLogsToCloudWatch:'),
        }),
      })
    );
  });

  test('OpenSearchZoneAwareness: OpenSearch Service domains have Zone Awareness enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchZoneAwareness:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchZoneAwareness:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new LegacyDomain(compliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      capacity: { masterNodes: 42 },
      zoneAwareness: { enabled: true },
    });
    new Domain(compliant, 'rDomain2', {
      version: EngineVersion.OPENSEARCH_1_0,
      capacity: { masterNodes: 42 },
      zoneAwareness: { enabled: true },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('OpenSearchZoneAwareness:'),
        }),
      })
    );
  });
});

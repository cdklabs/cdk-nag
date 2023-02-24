/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  CfnDomain as LegacyCfnDomain,
  Domain as LegacyDomain,
  ElasticsearchVersion,
} from 'aws-cdk-lib/aws-elasticsearch';
import {
  AccountRootPrincipal,
  AnyPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
} from 'aws-cdk-lib/aws-iam';
import {
  CfnDomain,
  Domain,
  EngineVersion,
} from 'aws-cdk-lib/aws-opensearchservice';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
import {
  OpenSearchAllowlistedIPs,
  OpenSearchDedicatedMasterNode,
  OpenSearchEncryptedAtRest,
  OpenSearchErrorLogsToCloudWatch,
  OpenSearchInVPCOnly,
  OpenSearchNodeToNodeEncryption,
  OpenSearchNoUnsignedOrAnonymousAccess,
  OpenSearchSlowLogsToCloudWatch,
  OpenSearchZoneAwareness,
} from '../../src/rules/opensearch';

const testPack = new TestPack([
  OpenSearchAllowlistedIPs,
  OpenSearchDedicatedMasterNode,
  OpenSearchEncryptedAtRest,
  OpenSearchErrorLogsToCloudWatch,
  OpenSearchInVPCOnly,
  OpenSearchNoUnsignedOrAnonymousAccess,
  OpenSearchNodeToNodeEncryption,
  OpenSearchSlowLogsToCloudWatch,
  OpenSearchZoneAwareness,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon OpenSearch Service', () => {
  describe('OpenSearchAllowlistedIPs: OpenSearch Service domains only grant access via allowlisted IP addresses', () => {
    const ruleId = 'OpenSearchAllowlistedIPs';
    test('Noncompliance 1', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'Role', {
                  assumedBy: new AccountRootPrincipal(),
                }),
              ],
              resources: ['*'],
            }),
          ],
        }).toJSON(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(stack, 'Role', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
          }),
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnDomain(stack, 'Domain', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'Role', {
                  assumedBy: new AccountRootPrincipal(),
                }),
              ],
              resources: ['*'],
            }),
          ],
        }).toJSON(),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(stack, 'Role', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
          }),
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'Role', {
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
      new CfnDomain(stack, 'Domain2', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'Role2', {
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
      new LegacyDomain(stack, 'Domain3', {
        version: ElasticsearchVersion.V7_10,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(stack, 'Role3', {
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
      });
      new Domain(stack, 'Domain4', {
        version: EngineVersion.OPENSEARCH_1_0,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(stack, 'Role4', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            resources: ['*'],
            conditions: {
              IpAddress: {
                'aws:sourceIp': [new Vpc(stack, 'vpc').vpcCidrBlock],
              },
            },
          }),
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchDedicatedMasterNode: OpenSearch Service domains use dedicated master nodes', () => {
    const ruleId = 'OpenSearchDedicatedMasterNode';
    test('Noncompliance 1', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        capacity: { masterNodes: 42 },
      });
      new Domain(stack, 'Domain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        capacity: { masterNodes: 42 },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchEncryptedAtRest: OpenSearch Service domains have encryption at rest enabled', () => {
    const ruleId = 'OpenSearchEncryptedAtRest';
    test('Noncompliance 1', () => {
      new LegacyCfnDomain(stack, 'Domain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDomain(stack, 'Domain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        encryptionAtRestOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnDomain(stack, 'Domain', {
        encryptionAtRestOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        encryptionAtRestOptions: {
          enabled: true,
        },
      });
      new CfnDomain(stack, 'Domain2', {
        encryptionAtRestOptions: {
          enabled: true,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchErrorLogsToCloudWatch: OpenSearch Service domains stream error logs to CloudWatch Logs', () => {
    const ruleId = 'OpenSearchErrorLogsToCloudWatch';
    test('Noncompliance 1', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        logging: { appLogEnabled: true },
      });
      new Domain(stack, 'Domain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { appLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchInVPCOnly: OpenSearch Service domains are within VPCs', () => {
    const ruleId = 'OpenSearchInVPCOnly';
    test('Noncompliance 1', () => {
      new LegacyCfnDomain(stack, 'Domain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDomain(stack, 'Domain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        vpcOptions: {
          subnetIds: [],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnDomain(stack, 'Domain', {
        vpcOptions: {
          subnetIds: [],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        vpcOptions: {
          subnetIds: ['mycoolsubnet'],
        },
      });
      new CfnDomain(stack, 'Domain2', {
        vpcOptions: {
          subnetIds: ['mycoolsubnet'],
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchNoUnsignedOrAnonymousAccess: OpenSearch Service domains do not allow for unsigned requests or anonymous access', () => {
    const ruleId = 'OpenSearchNoUnsignedOrAnonymousAccess';
    test('Noncompliance 1', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        accessPolicies: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            resources: ['*'],
          }),
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
        accessPolicies: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            resources: ['*'],
          }),
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5', () => {
      new LegacyCfnDomain(stack, 'Domain', {
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 6', () => {
      new CfnDomain(stack, 'Domain', {
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'Role', {
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
      new CfnDomain(stack, 'Domain2', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'Role2', {
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
      new Domain(stack, 'Domain3', {
        version: EngineVersion.ELASTICSEARCH_7_10,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(stack, 'Role3', {
                assumedBy: new AccountRootPrincipal(),
              }),
            ],
            actions: ['es:ESHttpPost', 'es:ESHttpPut', 'es:ESHttpGet'],
            resources: ['*'],
            conditions: {
              IpAddress: {
                'aws:sourceIp': [new Vpc(stack, 'vpc').vpcCidrBlock],
              },
            },
          }),
        ],
      });
      new LegacyDomain(stack, 'Domain4', {
        version: ElasticsearchVersion.V7_10,
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
              new Role(stack, 'Role4', {
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
      });

      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchNodeToNodeEncryption: OpenSearch Service domains are node-to-node encrypted', () => {
    const ruleId = 'OpenSearchNodeToNodeEncryption';
    test('Noncompliance 1', () => {
      new LegacyCfnDomain(stack, 'Domain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDomain(stack, 'Domain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        nodeToNodeEncryptionOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnDomain(stack, 'Domain', {
        nodeToNodeEncryptionOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'Domain', {
        nodeToNodeEncryptionOptions: {
          enabled: true,
        },
      });
      new CfnDomain(stack, 'Domain2', {
        nodeToNodeEncryptionOptions: {
          enabled: true,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchSlowLogsToCloudWatch: OpenSearch Service domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs', () => {
    const ruleId = 'OpenSearchSlowLogsToCloudWatch';
    test('Noncompliance 1: expect findings for all logs on the Legacy Domain', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(
        stack,
        `${ruleId}[LogExport::SEARCH_SLOW_LOGS]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::INDEX_SLOW_LOGS]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Noncompliance 2: expect findings for all logs on the OpenSearch Domain', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(
        stack,
        `${ruleId}[LogExport::SEARCH_SLOW_LOGS]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::INDEX_SLOW_LOGS]`,
        TestType.NON_COMPLIANCE
      );
    });
    test("Noncompliance 3: expect finding for only 'INDEX_SLOW_LOGS' on the Legacy Domain", () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowSearchLogEnabled: true },
      });
      validateStack(
        stack,
        `${ruleId}\\[LogExport::SEARCH_SLOW_LOGS\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::INDEX_SLOW_LOGS]`,
        TestType.NON_COMPLIANCE
      );
    });
    test("Noncompliance 4: expect finding for only 'INDEX_SLOW_LOGS' on the OpenSearch Domain", () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowSearchLogEnabled: true },
      });
      validateStack(
        stack,
        `${ruleId}\\[LogExport::SEARCH_SLOW_LOGS\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::INDEX_SLOW_LOGS]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      new Domain(stack, 'Domain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchZoneAwareness: OpenSearch Service domains have Zone Awareness enabled', () => {
    const ruleId = 'OpenSearchZoneAwareness';
    test('Noncompliance 1', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'Domain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'Domain', {
        version: ElasticsearchVersion.V7_10,
        capacity: { masterNodes: 42 },
        zoneAwareness: { enabled: true },
      });
      new Domain(stack, 'Domain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        capacity: { masterNodes: 42 },
        zoneAwareness: { enabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  CfnDomain as LegacyCfnDomain,
  Domain as LegacyDomain,
  ElasticsearchVersion,
} from '@aws-cdk/aws-elasticsearch';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  Role,
  AccountRootPrincipal,
  AnyPrincipal,
} from '@aws-cdk/aws-iam';
import {
  CfnDomain,
  Domain,
  EngineVersion,
} from '@aws-cdk/aws-opensearchservice';
import { Aspects, Stack } from '@aws-cdk/core';
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
import { validateStack, TestType, TestPack } from './utils';

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
      new LegacyCfnDomain(stack, 'rDomain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'rRole', {
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
      new CfnDomain(stack, 'rDomain', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'rRole', {
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
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'rRole', {
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
      new CfnDomain(stack, 'rDomain2', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'rRole2', {
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchDedicatedMasterNode: OpenSearch Service domains use dedicated master nodes', () => {
    const ruleId = 'OpenSearchDedicatedMasterNode';
    test('Noncompliance 1', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        capacity: { masterNodes: 42 },
      });
      new Domain(stack, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        capacity: { masterNodes: 42 },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchEncryptedAtRest: OpenSearch Service domains have encryption at rest enabled', () => {
    const ruleId = 'OpenSearchEncryptedAtRest';
    test('Noncompliance 1', () => {
      new LegacyCfnDomain(stack, 'rDomain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDomain(stack, 'rDomain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
        encryptionAtRestOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnDomain(stack, 'rDomain', {
        encryptionAtRestOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
        encryptionAtRestOptions: {
          enabled: true,
        },
      });
      new CfnDomain(stack, 'rDomain2', {
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
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new Domain(stack, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        logging: { appLogEnabled: true },
      });
      new Domain(stack, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { appLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchInVPCOnly: OpenSearch Service domains are within VPCs', () => {
    const ruleId = 'OpenSearchInVPCOnly';
    test('Noncompliance 1', () => {
      new LegacyCfnDomain(stack, 'rDomain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDomain(stack, 'rDomain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
        vpcOptions: {
          subnetIds: [],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnDomain(stack, 'rDomain', {
        vpcOptions: {
          subnetIds: [],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
        vpcOptions: {
          subnetIds: ['mycoolsubnet'],
        },
      });
      new CfnDomain(stack, 'rDomain2', {
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
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        accessPolicies: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
        accessPolicies: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
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
    test('Noncompliance 4', () => {
      new CfnDomain(stack, 'rDomain', {
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
      new LegacyCfnDomain(stack, 'rDomain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'rRole', {
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
      new CfnDomain(stack, 'rDomain2', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(stack, 'rRole2', {
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchNodeToNodeEncryption: OpenSearch Service domains are node-to-node encrypted', () => {
    const ruleId = 'OpenSearchNodeToNodeEncryption';
    test('Noncompliance 1', () => {
      new LegacyCfnDomain(stack, 'rDomain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDomain(stack, 'rDomain', {});
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
        nodeToNodeEncryptionOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnDomain(stack, 'rDomain', {
        nodeToNodeEncryptionOptions: {
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyCfnDomain(stack, 'rDomain', {
        nodeToNodeEncryptionOptions: {
          enabled: true,
        },
      });
      new CfnDomain(stack, 'rDomain2', {
        nodeToNodeEncryptionOptions: {
          enabled: true,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchSlowLogsToCloudWatch: OpenSearch Service domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs', () => {
    const ruleId = 'OpenSearchSlowLogsToCloudWatch';
    test('Noncompliance 1', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowIndexLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new Domain(stack, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowIndexLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      new Domain(stack, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('OpenSearchZoneAwareness: OpenSearch Service domains have Zone Awareness enabled', () => {
    const ruleId = 'OpenSearchZoneAwareness';
    test('Noncompliance 1', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Domain(stack, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LegacyDomain(stack, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        capacity: { masterNodes: 42 },
        zoneAwareness: { enabled: true },
      });
      new Domain(stack, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        capacity: { masterNodes: 42 },
        zoneAwareness: { enabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

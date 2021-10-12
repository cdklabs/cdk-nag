/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  CfnDomain as LegacyCfnDomain,
  Domain as LegacyDomain,
  ElasticsearchVersion,
} from '@aws-cdk/aws-elasticsearch';
import { CfnCluster } from '@aws-cdk/aws-emr';
import {
  AccountRootPrincipal,
  AnyPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';
import { Stream, StreamEncryption } from '@aws-cdk/aws-kinesis';
import { CfnApplicationV2 } from '@aws-cdk/aws-kinesisanalytics';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { LogGroup } from '@aws-cdk/aws-logs';
import {
  Cluster,
  KafkaVersion,
  ClientBrokerEncryption,
} from '@aws-cdk/aws-msk';
import {
  CfnDomain,
  Domain,
  EngineVersion,
} from '@aws-cdk/aws-opensearchservice';
import { CfnDataSource } from '@aws-cdk/aws-quicksight';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Analytics Learning Checks', () => {
  describe('Amazon Athena', () => {
    test('awsSolutionsAth1: Athena workgroups encrypt query results', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnWorkGroup(positive, 'rWorkgroup', {
        name: 'foo',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnWorkGroup(positive2, 'rWorkgroup', {
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
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );
      const positive3 = new Stack();
      Aspects.of(positive3).add(new AwsSolutionsChecks());
      new CfnWorkGroup(positive3, 'rWorkgroup', {
        name: 'foo',
        workGroupConfiguration: {
          enforceWorkGroupConfiguration: true,
          requesterPaysEnabled: true,
        },
      });
      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );
      const positive4 = new Stack();
      Aspects.of(positive4).add(new AwsSolutionsChecks());
      new CfnWorkGroup(positive4, 'rWorkgroup', {
        name: 'foo',
        workGroupConfiguration: {
          enforceWorkGroupConfiguration: true,
          resultConfiguration: {
            outputLocation: 'bar',
          },
        },
      });
      const messages4 = SynthUtils.synthesize(positive4).messages;
      expect(messages4).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );
      const positive5 = new Stack();
      Aspects.of(positive5).add(new AwsSolutionsChecks());
      new CfnWorkGroup(positive5, 'rWorkgroup', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          enforceWorkGroupConfiguration: false,
          resultConfigurationUpdates: {
            removeEncryptionConfiguration: true,
          },
        },
      });
      const messages5 = SynthUtils.synthesize(positive5).messages;
      expect(messages5).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );

      const positive6 = new Stack();
      Aspects.of(positive6).add(new AwsSolutionsChecks());
      new CfnWorkGroup(positive6, 'rWorkgroup', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          enforceWorkGroupConfiguration: true,
          resultConfigurationUpdates: {
            removeEncryptionConfiguration: true,
          },
        },
      });
      const messages6 = SynthUtils.synthesize(positive6).messages;
      expect(messages6).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );

      const positive7 = new Stack();
      Aspects.of(positive7).add(new AwsSolutionsChecks());
      new CfnWorkGroup(positive7, 'rWorkgroup', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          resultConfigurationUpdates: {
            encryptionConfiguration: {
              encryptionOption: 'SSE_S3',
            },
          },
        },
      });
      const messages7 = SynthUtils.synthesize(positive7).messages;
      expect(messages7).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnWorkGroup(negative, 'rWorkgroup', {
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
      new CfnWorkGroup(negative, 'rWorkgroup2', {
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
      new CfnWorkGroup(negative, 'rWorkgroup3', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          requesterPaysEnabled: true,
        },
      });
      new CfnWorkGroup(negative, 'rWorkgroup4', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          enforceWorkGroupConfiguration: true,
          requesterPaysEnabled: true,
        },
      });
      const messages8 = SynthUtils.synthesize(negative).messages;
      expect(messages8).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-ATH1:'),
          }),
        })
      );
    });
  });
  describe('Amazon EMR', () => {
    test('awsSolutionsEmr2: EMR clusters have S3 logging enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnCluster(positive, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EMR2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnCluster(negative, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        logUri: 'baz',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EMR2:'),
          }),
        })
      );
    });
    test('awsSolutionsEmr6: EMR clusters implement authentication via an EC2 Key Pair or Kerberos', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnCluster(positive, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EMR6:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnCluster(negative, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        kerberosAttributes: {
          kdcAdminPassword: 'baz',
          realm: 'qux',
        },
      });
      new CfnCluster(negative, 'rEmrCluster2', {
        instances: { ec2KeyName: 'baz' },
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-EMR6:'),
          }),
        })
      );
    });
  });
  describe('Amazon OpenSearch Service', () => {
    test('awsSolutionsOs1: OpenSearch Service domains are provisioned inside a VPC', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyDomain(positive, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS1:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Domain(positive, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyDomain(negative, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        vpc: new Vpc(negative, 'rVpc'),
      });
      new Domain(negative, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        vpc: new Vpc(negative, 'rVpc2'),
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS1:'),
          }),
        })
      );
    });
    test('awsSolutionsOs2: OpenSearch Service domains have node-to-node encryption enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyDomain(positive, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS2:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Domain(positive2, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyDomain(negative, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        nodeToNodeEncryption: true,
      });
      new Domain(negative, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
        nodeToNodeEncryption: true,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS2:'),
          }),
        })
      );
    });
    test('awsSolutionsOs3: OpenSearch Service domains only grant access via allowlisted IP addresses', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyCfnDomain(positive, 'rDomain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(positive, 'rRole', {
                  assumedBy: new AccountRootPrincipal(),
                }),
              ],
              resources: ['*'],
            }),
          ],
        }).toJSON(),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS3:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnDomain(positive, 'rDomain', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(positive, 'rRole', {
                  assumedBy: new AccountRootPrincipal(),
                }),
              ],
              resources: ['*'],
            }),
          ],
        }).toJSON(),
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyCfnDomain(negative, 'rDomain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(negative, 'rRole', {
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
      new CfnDomain(negative, 'rDomain2', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(negative, 'rRole2', {
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
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS3:'),
          }),
        })
      );
    });
    test('awsSolutionsOs4: OpenSearch Service domains use dedicated master nodes', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyDomain(positive, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS4:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Domain(positive2, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS4:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyDomain(negative, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        capacity: { masterNodes: 42 },
      });
      new Domain(negative, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        capacity: { masterNodes: 42 },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS4:'),
          }),
        })
      );
    });
    test('awsSolutionsOs5: OpenSearch Service domains do not allow for unsigned requests or anonymous access', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyDomain(positive, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        accessPolicies: [],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS5:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Domain(positive2, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
        accessPolicies: [],
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS5:'),
          }),
        })
      );

      const positive3 = new Stack();
      Aspects.of(positive3).add(new AwsSolutionsChecks());
      new LegacyCfnDomain(positive3, 'rDomain', {
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

      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS5:'),
          }),
        })
      );

      const positive4 = new Stack();
      Aspects.of(positive4).add(new AwsSolutionsChecks());
      new CfnDomain(positive4, 'rDomain', {
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

      const messages4 = SynthUtils.synthesize(positive4).messages;
      expect(messages4).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS5:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyCfnDomain(negative, 'rDomain', {
        elasticsearchVersion: ElasticsearchVersion.V7_10.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(negative, 'rRole', {
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
      new CfnDomain(negative, 'rDomain2', {
        engineVersion: EngineVersion.OPENSEARCH_1_0.version,
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [
                new Role(negative, 'rRole2', {
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
      const messages5 = SynthUtils.synthesize(negative).messages;
      expect(messages5).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS5:'),
          }),
        })
      );
    });
    test('awsSolutionsOs7: OpenSearch Service domains have Zone Awareness enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyDomain(positive, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS7:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Domain(positive2, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS7:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyDomain(negative, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        capacity: { masterNodes: 42 },
        zoneAwareness: { enabled: true },
      });
      new Domain(negative, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        capacity: { masterNodes: 42 },
        zoneAwareness: { enabled: true },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS7:'),
          }),
        })
      );
    });
    test('awsSolutionsOs8: OpenSearch Service domains have encryption at rest enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyDomain(positive, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS8:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Domain(positive, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS8:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyDomain(negative, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        encryptionAtRest: { enabled: true },
      });
      new Domain(negative, 'rDomain2', {
        version: EngineVersion.OPENSEARCH_1_0,
        encryptionAtRest: { enabled: true },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS8:'),
          }),
        })
      );
    });
    test('awsSolutionsOs9: OpenSearch Service domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new LegacyDomain(positive, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS9:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Domain(positive2, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
      });
      const messages2 = SynthUtils.synthesize(positive).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS9:'),
          }),
        })
      );

      const positive3 = new Stack();
      Aspects.of(positive3).add(new AwsSolutionsChecks());
      new LegacyDomain(positive3, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowIndexLogEnabled: true },
      });
      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS9:'),
          }),
        })
      );

      const positive4 = new Stack();
      Aspects.of(positive4).add(new AwsSolutionsChecks());
      new Domain(positive4, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowIndexLogEnabled: true },
      });
      const messages4 = SynthUtils.synthesize(positive4).messages;
      expect(messages4).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS9:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new LegacyDomain(negative, 'rDomain', {
        version: ElasticsearchVersion.V7_10,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      new Domain(negative, 'rDomain', {
        version: EngineVersion.OPENSEARCH_1_0,
        logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
      });
      const messages5 = SynthUtils.synthesize(negative).messages;
      expect(messages5).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-OS9:'),
          }),
        })
      );
    });
  });
  describe('Amazon Kinesis Data Analytics', () => {
    test('awsSolutionsKda3: KDA Flink Applications have checkpointing enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnApplicationV2(positive, 'rFlinkApp', {
        runtimeEnvironment: 'FLINK-1_11',
        serviceExecutionRole: new Role(positive, 'rKdaRole', {
          assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
        }).roleArn,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KDA3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnApplicationV2(negative, 'rFlinkApp', {
        runtimeEnvironment: 'FLINK-1_11',
        serviceExecutionRole: new Role(negative, 'rKdaRole', {
          assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
        }).roleArn,
        applicationConfiguration: {
          flinkApplicationConfiguration: {
            checkpointConfiguration: {
              configurationType: 'DEFAULT',
            },
          },
        },
      });
      new CfnApplicationV2(negative, 'rFlinkApp2', {
        runtimeEnvironment: 'FLINK-1_11',
        serviceExecutionRole: new Role(negative, 'rKdaRole2', {
          assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
        }).roleArn,
        applicationConfiguration: {
          flinkApplicationConfiguration: {
            checkpointConfiguration: {
              configurationType: 'CUSTOM',
              checkpointingEnabled: true,
            },
          },
        },
      });
      new CfnApplicationV2(negative, 'rZeppelinApp', {
        runtimeEnvironment: 'ZEPPELIN-FLINK-1_0',
        serviceExecutionRole: new Role(negative, 'rKdaRole3', {
          assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
        }).roleArn,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KDA3:'),
          }),
        })
      );
    });
  });
  describe('Amazon Kinesis Data Streams (KDS)', () => {
    test('awsSolutionsKds1: Kinesis Data Streams have server-side encryption enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Stream(positive, 'rKds', {
        encryption: StreamEncryption.UNENCRYPTED,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KDS1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Stream(negative, 'rKds', { encryption: StreamEncryption.KMS });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KDS1:'),
          }),
        })
      );
    });
  });
  describe('Amazon Kinesis Data Firehose', () => {
    test('awsSolutionsKdf1: Kinesis Data Firehose delivery streams have server-side encryption enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnDeliveryStream(positive, 'rKdf', {
        s3DestinationConfiguration: {
          bucketArn: new Bucket(positive, 'rDeliveryBucket').bucketArn,
          roleArn: new Role(positive, 'rKdfRole', {
            assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
          }).roleArn,
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KDF1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnDeliveryStream(negative, 'rKdf', {
        s3DestinationConfiguration: {
          bucketArn: new Bucket(negative, 'rDeliveryBucket').bucketArn,
          roleArn: new Role(negative, 'rKdfRole', {
            assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
          }).roleArn,
        },
        deliveryStreamEncryptionConfigurationInput: {
          keyType: 'AWS_OWNED_CMK',
        },
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-KDF1:'),
          }),
        })
      );
    });
  });
  describe('Amazon Managed Streaming for Apache Kafka (Amazon MSK)', () => {
    test('awsSolutionsMsk2: MSK clusters only uses TLS communication between clients and brokers', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Cluster(positive, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(positive, 'rVpc'),
        encryptionInTransit: {
          clientBroker: ClientBrokerEncryption.TLS_PLAINTEXT,
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-MSK2:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(negative, 'rVpc'),
        encryptionInTransit: {
          clientBroker: ClientBrokerEncryption.TLS,
        },
      });
      new Cluster(negative, 'rMsk2', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(negative, 'rVpc2'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-MSK2:'),
          }),
        })
      );
    });
    test('awsSolutionsMsk3: MSK clusters use TLS communication between brokers', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Cluster(positive, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(positive, 'rVpc'),
        encryptionInTransit: {
          enableInCluster: false,
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-MSK3:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(negative, 'rVpc'),
        encryptionInTransit: {
          enableInCluster: true,
        },
      });
      new Cluster(negative, 'rMsk2', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(negative, 'rVpc2'),
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-MSK3:'),
          }),
        })
      );
    });
    test('awsSolutionsMsk6: MSK clusters send broker logs to a supported destination', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Cluster(positive, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(positive, 'rVpc'),
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-MSK6:'),
          }),
        })
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Cluster(positive2, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(positive2, 'rVpc'),
        logging: {},
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-MSK6:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Cluster(negative, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(negative, 'rVpc'),
        logging: {
          s3: { bucket: new Bucket(negative, 'rLoggingBucket') },
          cloudwatchLogGroup: new LogGroup(negative, 'rLogGroup'),
        },
      });
      new Cluster(negative, 'rMsk2', {
        clusterName: 'foo',
        kafkaVersion: KafkaVersion.V2_8_0,
        vpc: new Vpc(negative, 'rVpc2'),
        logging: {
          firehoseDeliveryStreamName: 'bar',
        },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-MSK6:'),
          }),
        })
      );
    });
  });
  describe('Amazon QuickSight', () => {
    test('awsSolutionsQs1: Quicksight data sources connections are configured to use SSL', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnDataSource(positive, 'rDashboard', {
        sslProperties: { disableSsl: true },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-QS1:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new CfnDataSource(negative, 'rDashboard', {
        sslProperties: { disableSsl: false },
      });
      new CfnDataSource(negative, 'rDashboard2', {
        sslProperties: {},
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-QS1:'),
          }),
        })
      );
    });
  });
});

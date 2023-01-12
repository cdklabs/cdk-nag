/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from 'aws-cdk-lib/aws-msk';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  MSKBrokerLogging,
  MSKBrokerToBrokerTLS,
  MSKClientToBrokerTLS,
} from '../../src/rules/msk';

const testPack = new TestPack([
  MSKBrokerLogging,
  MSKBrokerToBrokerTLS,
  MSKClientToBrokerTLS,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Managed Streaming for Apache Kafka (Amazon MSK)', () => {
  describe('MSKBrokerLogging: MSK clusters send broker logs to a supported destination', () => {
    const ruleId = 'MSKBrokerLogging';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCluster(stack, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
        loggingInfo: { brokerLogs: {} },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
        loggingInfo: {
          brokerLogs: {
            s3: { enabled: true, bucket: 'foo' },
            cloudWatchLogs: { enabled: true, logGroup: 'baz' },
          },
        },
      });

      new CfnCluster(stack, 'rMsk2', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
        loggingInfo: {
          brokerLogs: { firehose: { enabled: true, deliveryStream: 'foo' } },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('MSKBrokerToBrokerTLS: MSK clusters use TLS communication between brokers', () => {
    const ruleId = 'MSKBrokerToBrokerTLS';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
        encryptionInfo: { encryptionInTransit: { inCluster: false } },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
        encryptionInfo: { encryptionInTransit: { inCluster: true } },
      });
      new CfnCluster(stack, 'rMsk2', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('MSKClientToBrokerTLS: MSK clusters only uses TLS communication between clients and brokers', () => {
    const ruleId = 'MSKClientToBrokerTLS';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
        encryptionInfo: {
          encryptionInTransit: { clientBroker: 'TLS_PLAINTEXT' },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnCluster(stack, 'rMsk', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
        encryptionInfo: { encryptionInTransit: { clientBroker: 'TLS' } },
      });
      new CfnCluster(stack, 'rMsk2', {
        clusterName: 'foo',
        kafkaVersion: '2.8.0',
        brokerNodeGroupInfo: {
          clientSubnets: ['bar'],
          instanceType: 'kafka.m5.large',
        },
        numberOfBrokerNodes: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

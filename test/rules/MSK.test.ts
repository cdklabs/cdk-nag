/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-msk';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  MSKBrokerLogging,
  MSKBrokerToBrokerTLS,
  MSKClientToBrokerTLS,
} from '../../src/rules/msk';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        MSKBrokerLogging,
        MSKBrokerToBrokerTLS,
        MSKClientToBrokerTLS,
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

describe('Amazon Managed Streaming for Apache Kafka (Amazon MSK)', () => {
  test('MSKBrokerLogging: MSK clusters send broker logs to a supported destination', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: '2.8.0',
      brokerNodeGroupInfo: {
        clientSubnets: ['bar'],
        instanceType: 'kafka.m5.large',
      },
      numberOfBrokerNodes: 42,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MSKBrokerLogging:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCluster(nonCompliant2, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: '2.8.0',
      brokerNodeGroupInfo: {
        clientSubnets: ['bar'],
        instanceType: 'kafka.m5.large',
      },
      numberOfBrokerNodes: 42,
      loggingInfo: { brokerLogs: {} },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MSKBrokerLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rMsk', {
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

    new CfnCluster(compliant, 'rMsk2', {
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
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MSKBrokerLogging:'),
        }),
      })
    );
  });

  test('MSKBrokerToBrokerTLS: MSK clusters use TLS communication between brokers', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: '2.8.0',
      brokerNodeGroupInfo: {
        clientSubnets: ['bar'],
        instanceType: 'kafka.m5.large',
      },
      numberOfBrokerNodes: 42,
      encryptionInfo: { encryptionInTransit: { inCluster: false } },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MSKBrokerToBrokerTLS:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: '2.8.0',
      brokerNodeGroupInfo: {
        clientSubnets: ['bar'],
        instanceType: 'kafka.m5.large',
      },
      numberOfBrokerNodes: 42,
      encryptionInfo: { encryptionInTransit: { inCluster: true } },
    });
    new CfnCluster(compliant, 'rMsk2', {
      clusterName: 'foo',
      kafkaVersion: '2.8.0',
      brokerNodeGroupInfo: {
        clientSubnets: ['bar'],
        instanceType: 'kafka.m5.large',
      },
      numberOfBrokerNodes: 42,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MSKBrokerToBrokerTLS:'),
        }),
      })
    );
  });

  test('MSKClientToBrokerTLS: MSK clusters only uses TLS communication between clients and brokers', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rMsk', {
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
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MSKClientToBrokerTLS:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: '2.8.0',
      brokerNodeGroupInfo: {
        clientSubnets: ['bar'],
        instanceType: 'kafka.m5.large',
      },
      numberOfBrokerNodes: 42,
      encryptionInfo: { encryptionInTransit: { clientBroker: 'TLS' } },
    });
    new CfnCluster(compliant, 'rMsk2', {
      clusterName: 'foo',
      kafkaVersion: '2.8.0',
      brokerNodeGroupInfo: {
        clientSubnets: ['bar'],
        instanceType: 'kafka.m5.large',
      },
      numberOfBrokerNodes: 42,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MSKClientToBrokerTLS:'),
        }),
      })
    );
  });
});

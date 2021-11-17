/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { LogGroup } from '@aws-cdk/aws-logs';
import {
  ClientBrokerEncryption,
  Cluster,
  KafkaVersion,
} from '@aws-cdk/aws-msk';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
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
    new Cluster(nonCompliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(nonCompliant, 'rVpc'),
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
    new Cluster(nonCompliant2, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(nonCompliant2, 'rVpc'),
      logging: {},
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
    new Cluster(compliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(compliant, 'rVpc'),
      logging: {
        s3: { bucket: new Bucket(compliant, 'rLoggingBucket') },
        cloudwatchLogGroup: new LogGroup(compliant, 'rLogGroup'),
      },
    });
    new Cluster(compliant, 'rMSKClientToBrokerTLS', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(compliant, 'rVpc2'),
      logging: {
        firehoseDeliveryStreamName: 'bar',
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
    new Cluster(nonCompliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(nonCompliant, 'rVpc'),
      encryptionInTransit: {
        enableInCluster: false,
      },
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
    new Cluster(compliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(compliant, 'rVpc'),
      encryptionInTransit: {
        enableInCluster: true,
      },
    });
    new Cluster(compliant, 'rMSKClientToBrokerTLS', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(compliant, 'rVpc2'),
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
    new Cluster(nonCompliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(nonCompliant, 'rVpc'),
      encryptionInTransit: {
        clientBroker: ClientBrokerEncryption.TLS_PLAINTEXT,
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
    new Cluster(compliant, 'rMsk', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(compliant, 'rVpc'),
      encryptionInTransit: {
        clientBroker: ClientBrokerEncryption.TLS,
      },
    });
    new Cluster(compliant, 'rMSKClientToBrokerTLS', {
      clusterName: 'foo',
      kafkaVersion: KafkaVersion.V2_8_0,
      vpc: new Vpc(compliant, 'rVpc2'),
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

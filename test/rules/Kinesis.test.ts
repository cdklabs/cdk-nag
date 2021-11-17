/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { StreamEncryption, Stream } from '@aws-cdk/aws-kinesis';
import { CfnApplicationV2 } from '@aws-cdk/aws-kinesisanalytics';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  KinesisDataAnalyticsFlinkCheckpointing,
  KinesisDataFirehoseSSE,
  KinesisDataStreamDefaultKeyWhenSSE,
  KinesisDataStreamSSE,
} from '../../src/rules/kinesis';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        KinesisDataAnalyticsFlinkCheckpointing,
        KinesisDataFirehoseSSE,
        KinesisDataStreamDefaultKeyWhenSSE,
        KinesisDataStreamSSE,
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

describe('Amazon Kinesis Data Analytics', () => {
  test('KinesisDataAnalyticsFlinkCheckpointing: KDA Flink Applications have checkpointing enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnApplicationV2(nonCompliant, 'rFlinkApp', {
      runtimeEnvironment: 'FLINK-1_11',
      serviceExecutionRole: new Role(nonCompliant, 'rKdaRole', {
        assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
      }).roleArn,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'KinesisDataAnalyticsFlinkCheckpointing:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnApplicationV2(compliant, 'rFlinkApp', {
      runtimeEnvironment: 'FLINK-1_11',
      serviceExecutionRole: new Role(compliant, 'rKdaRole', {
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
    new CfnApplicationV2(compliant, 'rFlinkApp2', {
      runtimeEnvironment: 'FLINK-1_11',
      serviceExecutionRole: new Role(compliant, 'rKdaRole2', {
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
    new CfnApplicationV2(compliant, 'rZeppelinApp', {
      runtimeEnvironment: 'ZEPPELIN-FLINK-1_0',
      serviceExecutionRole: new Role(compliant, 'rKdaRole3', {
        assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
      }).roleArn,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'KinesisDataAnalyticsFlinkCheckpointing:'
          ),
        }),
      })
    );
  });
});

describe('Amazon Kinesis Data Firehose', () => {
  test('KinesisDataFirehoseSSE: Kinesis Data Firehose delivery streams have server-side encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDeliveryStream(nonCompliant, 'rKdf', {
      s3DestinationConfiguration: {
        bucketArn: new Bucket(nonCompliant, 'rDeliveryBucket').bucketArn,
        roleArn: new Role(nonCompliant, 'rKdfRole', {
          assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
        }).roleArn,
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KinesisDataFirehoseSSE:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnDeliveryStream(compliant, 'rKdf', {
      s3DestinationConfiguration: {
        bucketArn: new Bucket(compliant, 'rDeliveryBucket').bucketArn,
        roleArn: new Role(compliant, 'rKdfRole', {
          assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
        }).roleArn,
      },
      deliveryStreamEncryptionConfigurationInput: {
        keyType: 'AWS_OWNED_CMK',
      },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KinesisDataFirehoseSSE:'),
        }),
      })
    );
  });
});

describe('Amazon Kinesis Data Streams (KDS)', () => {
  test('KinesisDataStreamSSE: Kinesis Data Streams have server-side encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Stream(nonCompliant, 'rKds', {
      encryption: StreamEncryption.UNENCRYPTED,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KinesisDataStreamSSE:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Stream(compliant, 'rKds', { encryption: StreamEncryption.KMS });
    new Stream(compliant, 'rKds2', { encryption: StreamEncryption.MANAGED });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KinesisDataStreamSSE:'),
        }),
      })
    );
  });

  test('KinesisDataStreamDefaultKeyWhenSSE: Kinesis Data Streams use the "aws/kinesis" key when server-sided encryption is enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Stream(nonCompliant, 'rKds', {
      encryption: StreamEncryption.KMS,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KinesisDataStreamDefaultKeyWhenSSE:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Stream(compliant, 'rKds', { encryption: StreamEncryption.MANAGED });
    new Stream(compliant, 'rKds2', {
      encryption: StreamEncryption.UNENCRYPTED,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('KinesisDataStreamDefaultKeyWhenSSE:'),
        }),
      })
    );
  });
});

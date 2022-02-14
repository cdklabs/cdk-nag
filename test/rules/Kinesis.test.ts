/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { StreamEncryption, Stream } from 'aws-cdk-lib/aws-kinesis';
import { CfnApplicationV2 } from 'aws-cdk-lib/aws-kinesisanalytics';
import { CfnDeliveryStream } from 'aws-cdk-lib/aws-kinesisfirehose';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import {
  KinesisDataAnalyticsFlinkCheckpointing,
  KinesisDataFirehoseSSE,
  KinesisDataStreamDefaultKeyWhenSSE,
  KinesisDataStreamSSE,
} from '../../src/rules/kinesis';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  KinesisDataAnalyticsFlinkCheckpointing,
  KinesisDataFirehoseSSE,
  KinesisDataStreamDefaultKeyWhenSSE,
  KinesisDataStreamSSE,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Kinesis Data Analytics', () => {
  describe('KinesisDataAnalyticsFlinkCheckpointing: KDA Flink Applications have checkpointing enabled', () => {
    const ruleId = 'KinesisDataAnalyticsFlinkCheckpointing';
    test('Noncompliance 1', () => {
      new CfnApplicationV2(stack, 'rFlinkApp', {
        runtimeEnvironment: 'FLINK-1_11',
        serviceExecutionRole: new Role(stack, 'rKdaRole', {
          assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnApplicationV2(stack, 'rFlinkApp', {
        runtimeEnvironment: 'FLINK-1_11',
        serviceExecutionRole: new Role(stack, 'rKdaRole', {
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
      new CfnApplicationV2(stack, 'rFlinkApp2', {
        runtimeEnvironment: 'FLINK-1_11',
        serviceExecutionRole: new Role(stack, 'rKdaRole2', {
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
      new CfnApplicationV2(stack, 'rZeppelinApp', {
        runtimeEnvironment: 'ZEPPELIN-FLINK-1_0',
        serviceExecutionRole: new Role(stack, 'rKdaRole3', {
          assumedBy: new ServicePrincipal('kinesisanalytics.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

describe('Amazon Kinesis Data Firehose', () => {
  describe('KinesisDataFirehoseSSE: Kinesis Data Firehose delivery streams have server-side encryption enabled', () => {
    const ruleId = 'KinesisDataFirehoseSSE';
    test('Noncompliance 1', () => {
      new CfnDeliveryStream(stack, 'rKdf', {
        s3DestinationConfiguration: {
          bucketArn: new Bucket(stack, 'rDeliveryBucket').bucketArn,
          roleArn: new Role(stack, 'rKdfRole', {
            assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
          }).roleArn,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDeliveryStream(stack, 'rKdf', {
        s3DestinationConfiguration: {
          bucketArn: new Bucket(stack, 'rDeliveryBucket').bucketArn,
          roleArn: new Role(stack, 'rKdfRole', {
            assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
          }).roleArn,
        },
        deliveryStreamEncryptionConfigurationInput: {
          keyType: 'AWS_OWNED_CMK',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

describe('Amazon Kinesis Data Streams (KDS)', () => {
  describe('KinesisDataStreamSSE: Kinesis Data Streams have server-side encryption enabled', () => {
    const ruleId = 'KinesisDataStreamSSE';
    test('Noncompliance 1', () => {
      new Stream(stack, 'rKds', {
        encryption: StreamEncryption.UNENCRYPTED,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Stream(stack, 'rKds', { encryption: StreamEncryption.KMS });
      new Stream(stack, 'rKds2', { encryption: StreamEncryption.MANAGED });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('KinesisDataStreamDefaultKeyWhenSSE: Kinesis Data Streams use the "aws/kinesis" key when server-sided encryption is enabled', () => {
    const ruleId = 'KinesisDataStreamDefaultKeyWhenSSE';
    test('Noncompliance 1', () => {
      new Stream(stack, 'rKds', {
        encryption: StreamEncryption.KMS,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Stream(stack, 'rKds', { encryption: StreamEncryption.MANAGED });
      new Stream(stack, 'rKds2', {
        encryption: StreamEncryption.UNENCRYPTED,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDataSource } from 'aws-cdk-lib/aws-bedrock';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack, setActivePack } from './utils';
import { BedrockDataSourceKMSKeyConfigured } from '../../src/rules/bedrock';

const testPack = new TestPack([BedrockDataSourceKMSKeyConfigured]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  setActivePack(testPack);
});

const dataSourceProps = {
  name: 'datasource',
  knowledgeBaseId: 'KB12345678',
  dataSourceConfiguration: {
    type: 'S3',
    s3Configuration: { bucketArn: 'arn:aws:s3:::bucket' },
  },
};

describe('Amazon Bedrock', () => {
  describe('BedrockDataSourceKMSKeyConfigured: Bedrock knowledge base data sources are encrypted with a customer managed KMS key', () => {
    const ruleId = 'BedrockDataSourceKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnDataSource(stack, 'DataSource', dataSourceProps);
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDataSource(stack, 'DataSource', {
        ...dataSourceProps,
        serverSideEncryptionConfiguration: {},
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDataSource(stack, 'DataSource', {
        ...dataSourceProps,
        serverSideEncryptionConfiguration: {
          kmsKeyArn: new Key(stack, 'Key').keyArn,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

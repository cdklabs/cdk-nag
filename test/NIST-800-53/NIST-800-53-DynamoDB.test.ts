/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';


describe('Amazon DynamoDB', () => {
    test('NIST.800.53-DynamoDBPITREnabled: DynamoDB tables have point in time recovery enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new Table(positive, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-DynamoDBPITREnabled:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new Table(negative, 'rTable', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        pointInTimeRecovery: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-DynamoDBPITREnabled:'),
          }),
        }),
      );
    });
    test('NIST.800.53-DynamoDBTableEncryptedKMS', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new Table(positive, 'rTable2', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        pointInTimeRecovery: true
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-DynamoDBTableEncryptedKMS:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new Table(negative, 'rTable2', {
        partitionKey: { name: 'foo', type: AttributeType.STRING },
        serverSideEncryption: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-DynamoDBTableEncryptedKMS:'),
          }),
        }),
      );
    });
  });
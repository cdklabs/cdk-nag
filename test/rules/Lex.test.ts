/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBot, CfnBotAlias } from 'aws-cdk-lib/aws-lex';
import { Aspects, Stack } from 'aws-cdk-lib';
import { LexBotAliasEncryptedConversationLogs } from '../../src/rules/lex';
import { validateStack, TestType, TestPack } from './utils';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Key } from 'aws-cdk-lib/aws-kms';

const testPack = new TestPack([LexBotAliasEncryptedConversationLogs]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Lex', () => {
  describe('LexBotAliasEncryptedConversationLogs: Lex conversation logs are encrypted with KMS keys', () => {
    const ruleId = 'LexBotAliasEncryptedConversationLogs';
    test('Noncompliance 1', () => {
      new CfnBotAlias(stack, 'rBotAlias', {
        botAliasName: 'foo',
        botId: 'bar',
        conversationLogSettings: {
          audioLogSettings: [
            {
              destination: {
                s3Bucket: {
                  kmsKeyArn: 'foo',
                  s3BucketArn: 'bar',
                  logPrefix: 'baz',
                },
              },
              enabled: true,
            },
            {
              destination: {
                s3Bucket: { s3BucketArn: 'bar', logPrefix: 'baz' },
              },
              enabled: true,
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnBot(stack, 'rBot', {
        dataPrivacy: {},
        idleSessionTtlInSeconds: 42,
        name: 'foo',
        roleArn: 'bar',
        testBotAliasSettings: {
          conversationLogSettings: {
            audioLogSettings: [
              {
                destination: {
                  s3Bucket: {
                    kmsKeyArn: 'foo',
                    s3BucketArn: 'bar',
                    logPrefix: 'baz',
                  },
                },
                enabled: true,
              },
              {
                destination: {
                  s3Bucket: { s3BucketArn: 'bar', logPrefix: 'baz' },
                },
                enabled: true,
              },
            ],
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      const logGroup = new LogGroup(stack, 'LogGroup', {
        encryptionKey: undefined,
      });
      new CfnBotAlias(stack, 'rBotAlias', {
        botAliasName: 'foo',
        botId: 'bar',
        conversationLogSettings: {
          textLogSettings: [
            {
              destination: {
                cloudWatch: {
                  cloudWatchLogGroupArn: logGroup.logGroupArn,
                  logPrefix: 'bar',
                },
              },
              enabled: true,
            },
            {
              destination: {
                cloudWatch: { cloudWatchLogGroupArn: 'foo', logPrefix: 'bar' },
              },
              enabled: false,
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      const logGroup = new LogGroup(stack, 'LogGroup', {
        encryptionKey: undefined,
      });
      new CfnBot(stack, 'rBot', {
        dataPrivacy: {},
        idleSessionTtlInSeconds: 42,
        name: 'foo',
        roleArn: 'bar',
        testBotAliasSettings: {
          conversationLogSettings: {
            textLogSettings: [
              {
                destination: {
                  cloudWatch: {
                    cloudWatchLogGroupArn: logGroup.logGroupArn,
                    logPrefix: 'bar',
                  },
                },
                enabled: true,
              },
              {
                destination: {
                  cloudWatch: {
                    cloudWatchLogGroupArn: 'foo',
                    logPrefix: 'bar',
                  },
                },
                enabled: false,
              },
            ],
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Validation Failure 1 - using CloudWatch Log Group for text logs', () => {
      new CfnBotAlias(stack, 'rBotAlias', {
        botAliasName: 'foo',
        botId: 'bar',
        conversationLogSettings: {
          textLogSettings: [
            {
              destination: {
                cloudWatch: {
                  cloudWatchLogGroupArn: LogGroup.fromLogGroupName(
                    stack,
                    'Imported',
                    'Imported'
                  ).logGroupArn,
                  logPrefix: 'bar',
                },
              },
              enabled: true,
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.VALIDATION_FAILURE);
    });
    test('Compliance', () => {
      new CfnBotAlias(stack, 'rBotAlias', {
        botAliasName: 'foo',
        botId: 'bar',
        conversationLogSettings: {
          audioLogSettings: [
            {
              destination: {
                s3Bucket: {
                  kmsKeyArn: 'foo',
                  s3BucketArn: 'bar',
                  logPrefix: 'baz',
                },
              },
              enabled: true,
            },
            {
              destination: {
                s3Bucket: { s3BucketArn: 'bar', logPrefix: 'baz' },
              },
              enabled: false,
            },
          ],
        },
      });
      const logGroup = new LogGroup(stack, 'LogGroup', {
        encryptionKey: new Key(stack, 'Key'),
      });
      new CfnBotAlias(stack, 'rBotAlias2', {
        botAliasName: 'foo',
        botId: 'bar',
        conversationLogSettings: {
          textLogSettings: [
            {
              destination: {
                cloudWatch: {
                  cloudWatchLogGroupArn: logGroup.logGroupArn,
                  logPrefix: 'bar',
                },
              },
              enabled: true,
            },
          ],
        },
      });

      new CfnBotAlias(stack, 'rBotAlias3', {
        botAliasName: 'foo',
        botId: 'bar',
      });

      new CfnBot(stack, 'rBot', {
        dataPrivacy: {},
        idleSessionTtlInSeconds: 42,
        name: 'foo',
        roleArn: 'bar',
        testBotAliasSettings: {
          conversationLogSettings: {
            audioLogSettings: [
              {
                destination: {
                  s3Bucket: {
                    kmsKeyArn: 'foo',
                    s3BucketArn: 'bar',
                    logPrefix: 'baz',
                  },
                },
                enabled: true,
              },
            ],
            textLogSettings: [
              {
                destination: {
                  cloudWatch: {
                    cloudWatchLogGroupArn: logGroup.logGroupArn,
                    logPrefix: 'bar',
                  },
                },
                enabled: true,
              },
            ],
          },
        },
      });
      new CfnBot(stack, 'rEmptyBot', {
        dataPrivacy: {},
        idleSessionTtlInSeconds: 42,
        name: 'foo',
        roleArn: 'bar',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

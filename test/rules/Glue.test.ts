/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  CfnCrawler,
  CfnJob,
  CfnSecurityConfiguration,
} from '@aws-cdk/aws-glue';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  GlueEncryptedCloudWatchLogs,
  GlueJobBookmarkEncrypted,
} from '../../src/rules/glue';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  GlueEncryptedCloudWatchLogs,
  GlueJobBookmarkEncrypted,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Glue', () => {
  describe('GlueEncryptedCloudWatchLogs: Glue crawlers and jobs have CloudWatch Log encryption enabled', () => {
    const ruleId = 'GlueEncryptedCloudWatchLogs';
    test('Noncompliance 1', () => {
      new CfnCrawler(stack, 'rCrawler', {
        role: 'foo',
        targets: {},
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCrawler(stack, 'rCrawler', {
        role: 'foo',
        targets: {},
        crawlerSecurityConfiguration: 'bar',
      });
      new CfnSecurityConfiguration(stack, 'rSecurityConfig', {
        name: 'bar',
        encryptionConfiguration: {},
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnJob(stack, 'rJob', {
        role: 'foo',
        command: {},
        securityConfiguration: new CfnSecurityConfiguration(
          stack,
          'rSecurityConfig',
          {
            name: 'foo',
            encryptionConfiguration: {
              cloudWatchEncryption: { cloudWatchEncryptionMode: 'DISABLED' },
            },
          }
        ).ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCrawler(stack, 'rCrawler', {
        role: 'foo',
        targets: {},
        crawlerSecurityConfiguration: 'bar',
      });
      new CfnJob(stack, 'rJob', {
        role: 'foo',
        command: {},
        securityConfiguration: new CfnSecurityConfiguration(
          stack,
          'rSecurityConfig',
          {
            name: 'bar',
            encryptionConfiguration: {
              cloudWatchEncryption: { cloudWatchEncryptionMode: 'SSE-KMS' },
            },
          }
        ).ref,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
  describe('GlueJobBookmarkEncrypted: Glue job bookmarks have encryption at rest enabled', () => {
    const ruleId = 'GlueJobBookmarkEncrypted';
    test('Noncompliance 1', () => {
      new CfnJob(stack, 'rJob', {
        role: 'foo',
        command: {},
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnJob(stack, 'rJob', {
        role: 'foo',
        command: {},
        securityConfiguration: 'bar',
      });
      new CfnSecurityConfiguration(stack, 'rSecurityConfig', {
        name: 'bar',
        encryptionConfiguration: {},
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnJob(stack, 'rJob', {
        role: 'foo',
        command: {},
        securityConfiguration: new CfnSecurityConfiguration(
          stack,
          'rSecurityConfig',
          {
            name: 'foo',
            encryptionConfiguration: {
              jobBookmarksEncryption: {
                jobBookmarksEncryptionMode: 'DISABLED',
              },
            },
          }
        ).ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnJob(stack, 'rJob1', {
        role: 'foo',
        command: {},
        securityConfiguration: 'bar',
      });
      new CfnJob(stack, 'rJob2', {
        role: 'foo',
        command: {},
        securityConfiguration: new CfnSecurityConfiguration(
          stack,
          'rSecurityConfig',
          {
            name: 'bar',
            encryptionConfiguration: {
              jobBookmarksEncryption: { jobBookmarksEncryptionMode: 'CSE-KMS' },
            },
          }
        ).ref,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

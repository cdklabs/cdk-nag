/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnContainer } from 'aws-cdk-lib/aws-mediastore';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
import {
  MediaStoreCloudWatchMetricPolicy,
  MediaStoreContainerAccessLogging,
  MediaStoreContainerCORSPolicy,
  MediaStoreContainerHasContainerPolicy,
  MediaStoreContainerLifecyclePolicy,
  MediaStoreContainerSSLRequestsOnly,
} from '../../src/rules/mediastore';

const testPack = new TestPack([
  MediaStoreCloudWatchMetricPolicy,
  MediaStoreContainerAccessLogging,
  MediaStoreContainerCORSPolicy,
  MediaStoreContainerHasContainerPolicy,
  MediaStoreContainerLifecyclePolicy,
  MediaStoreContainerSSLRequestsOnly,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Elemental MediaStore', () => {
  describe('MediaStoreCloudWatchMetricPolicy: Media Store containers define metric policies to send metrics to CloudWatch', () => {
    const ruleId = 'MediaStoreCloudWatchMetricPolicy';
    test('Noncompliance 1', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
        metricPolicy: {
          containerLevelMetrics: 'ENABLED',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('MediaStoreContainerAccessLogging: Media Store containers have container access logging enabled', () => {
    const ruleId = 'MediaStoreContainerAccessLogging';
    test('Noncompliance 1', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
        accessLoggingEnabled: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('MediaStoreContainerCORSPolicy: Media Store containers define CORS policies', () => {
    const ruleId = 'MediaStoreContainerCORSPolicy';
    test('Noncompliance 1', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
        corsPolicy: [
          {
            allowedHeaders: ['foo'],
            allowedMethods: ['bar'],
            allowedOrigins: ['baz'],
            exposeHeaders: ['qux'],
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('MediaStoreContainerHasContainerPolicy: Media Store containers define container policies', () => {
    const ruleId = 'MediaStoreContainerHasContainerPolicy';
    test('Noncompliance 1', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
        policy: '{"Version":"2012-10-17","Statement":...}"',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('MediaStoreContainerLifecyclePolicy: Media Store containers define lifecycle policies', () => {
    const ruleId = 'MediaStoreContainerLifecyclePolicy';
    test('Noncompliance 1', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
        lifecyclePolicy:
          '{"rules":[{"definition":{"path":[{"wildcard":"stream/*.ts"}],"seconds_since_create":[{"numeric":[">",300]}]},"action":"EXPIRE"}]}',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('MediaStoreContainerSSLRequestsOnly: Media Store containers require requests to use SSL', () => {
    const ruleId = 'MediaStoreContainerSSLRequestsOnly';
    test('Noncompliance 1', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
        policy: JSON.stringify({
          Statement: [
            {
              Action: ['mediastore:PutObject'],
              Condition: {
                Bool: {
                  'aws:SecureTransport': false,
                },
              },
              Effect: 'Deny',
              Principal: '*',
              Resource:
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
            },
          ],
          Version: '2012-10-17',
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnContainer(stack, 'rMsContainer', {
        containerName: 'foo',
        policy: JSON.stringify({
          Statement: [
            {
              Action: ['mediastore:PutObject', '*'],
              Condition: {
                Bool: {
                  'aws:SecureTransport': false,
                },
              },
              Effect: 'Deny',
              Principal: '*',
              Resource:
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
            },
          ],
          Version: '2012-10-17',
        }),
      });
      new CfnContainer(stack, 'rMsContainer2', {
        containerName: 'bar',
        policy: JSON.stringify({
          Statement: [
            {
              Action: 'mediastore:putObject',
              Effect: 'Allow',
              Principal: {
                AWS: '*',
              },
              Resource:
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
            },
            {
              Action: ['mediastore:PutObject', '*'],
              Condition: {
                Bool: {
                  'aws:SecureTransport': 'false',
                },
              },
              Effect: 'Deny',
              Principal: {
                AWS: '*',
              },
              Resource:
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
            },
          ],
          Version: '2012-10-17',
        }),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});

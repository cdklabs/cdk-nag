/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Aspects, Stack } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnEnvironment } from 'aws-cdk-lib/aws-mwaa';
import { TestPack, TestType, validateStack } from './utils';
import { MWAAAllLoggingInfo } from '../../src/rules/mwaa';

const testPack = new TestPack([MWAAAllLoggingInfo]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Managed Workflows for Apache Airflow', () => {
  describe('MWAAAllLoggingInfo: Environment has Webserver logging enabled on at least INFO level', () => {
    const ruleId = 'MWAAAllLoggingInfo';
    test('Noncompliance 1: no loggingConfiguration', () => {
      new CfnEnvironment(stack, 'Environment', {
        name: 'environment',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2: no loggingConfiguration.dagProcessingLogs', () => {
      new CfnEnvironment(stack, 'Environment', {
        name: 'environment',
        loggingConfiguration: {
          schedulerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          taskLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          webserverLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          workerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3: loggingConfiguration.schedulerLogs.enabled is false', () => {
      new CfnEnvironment(stack, 'Environment', {
        name: 'environment',
        loggingConfiguration: {
          dagProcessingLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          schedulerLogs: {
            enabled: false,
            logLevel: 'INFO',
          },
          taskLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          workerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          webserverLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4: logLevel is not at least INFO', () => {
      new CfnEnvironment(stack, 'Environment', {
        name: 'environment',
        loggingConfiguration: {
          dagProcessingLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          schedulerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          taskLogs: {
            enabled: true,
            logLevel: 'ERROR',
          },
          workerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          webserverLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4: workerLogs.enabled is missing', () => {
      new CfnEnvironment(stack, 'Environment', {
        name: 'environment',
        loggingConfiguration: {
          dagProcessingLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          schedulerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          taskLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          workerLogs: {
            logLevel: 'INFO',
          },
          webserverLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4: webserverLogs.loglevel is missing', () => {
      new CfnEnvironment(stack, 'Environment', {
        name: 'environment',
        loggingConfiguration: {
          dagProcessingLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          schedulerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          taskLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          workerLogs: {
            logLevel: 'INFO',
          },
          webserverLogs: {
            enabled: true,
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEnvironment(stack, 'Environment', {
        name: 'environment',
        loggingConfiguration: {
          dagProcessingLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          schedulerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          taskLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          workerLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
          webserverLogs: {
            enabled: true,
            logLevel: 'INFO',
          },
        },
        kmsKey: new Key(stack, 'Key').keyArn,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
